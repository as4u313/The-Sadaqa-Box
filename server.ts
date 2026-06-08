import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runTransaction, doc } from 'firebase/firestore';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import Stripe from 'stripe';
import {
  db,
  savePlaidItem,
  getPlaidItem,
  getAllPlaidItems,
  saveTransactions,
  removeTransactions,
  getSavedTransactions,
  saveWebhookEvent,
  saveStripeCustomer,
  getFirstStripeCustomer,
  clearStripeCustomer,
  saveDonation,
  getDonation,
  getAllDonations,
  saveReservation,
  getReservation,
  getActiveReservations,
  deleteReservation,
  reserveAllAvailableRoundupFunds,
  processWebhookBalanceUpdate,
  rollbackReservationFunds,
  applyPlaidSyncCursor,
  resetRoundupTestState,
  cancelPriorRoundupWithdrawals
} from './src/db/firebase';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is required');
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe webhook must use raw body
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const rawBody = req.body;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).send('Missing signature or webhook secret');
    }

    let event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'payment_intent.processing' || event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const rawStatus = paymentIntent.status;
        const amount = paymentIntent.amount;
        
        let status = rawStatus as string;
        if (event.type === 'payment_intent.payment_failed') {
          status = 'payment_failed';
        }

        const type = paymentIntent.metadata?.donation_type;
        const reservationId = paymentIntent.metadata?.reservation_id;
        
        let errorDetails = null;
        if (event.type === 'payment_intent.payment_failed' && paymentIntent.last_payment_error) {
          errorDetails = {
            code: paymentIntent.last_payment_error.code,
            message: paymentIntent.last_payment_error.message,
          };
        }

        const existingDonation = await getDonation(paymentIntent.id);
        const createdAt = existingDonation ? existingDonation.createdAt : new Date().toISOString();

        await saveDonation(paymentIntent.id, {
          paymentIntentId: paymentIntent.id,
          amount,
          status,
          type: type || 'direct',
          reservationId: reservationId || null,
          createdAt,
          updatedAt: new Date().toISOString(),
          errorDetails: errorDetails || (existingDonation ? existingDonation.errorDetails : null),
        });

        // Webhook Balance updates
        const itemId = paymentIntent.metadata?.item_id;
        const oldStatus = existingDonation ? existingDonation.status : null;
        if (itemId && type === 'roundup_withdrawal' && oldStatus !== status) {
          if (status === 'succeeded') {
            await processWebhookBalanceUpdate(itemId, amount, 'succeeded');
            applyNewRoundupsAndEvaluateWithdrawal(itemId, 0, 'webhook_success').catch(err => console.error('auto-eval error after success:', err));
          } else if (status === 'payment_failed') {
            await processWebhookBalanceUpdate(itemId, amount, 'failed');
          }
        }
      }
    } catch (err) {
      console.error('Error handling webhook event', err);
    }
    res.send();
  });

  app.use(express.json());

  let configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
        'PLAID-SECRET': process.env.PLAID_SECRET || '',
      },
    },
  });

  let plaidClient = new PlaidApi(configuration);

  async function performTransactionsSync(itemId: string) {
    const item = await getPlaidItem(itemId);
    if (!item) {
      console.error('Item not found in Firestore:', itemId);
      return;
    }

    let hasMore = true;
    let currentCursor = item.cursor || undefined;
    let isBaseline = item.baselineStatus === 'loading';
    let addedRoundupsCents = 0;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: item.accessToken,
        cursor: currentCursor,
      });

      const added = response.data.added;
      const modified = response.data.modified;
      const removed = response.data.removed;

      hasMore = response.data.has_more;
      currentCursor = response.data.next_cursor;

      const formattedAdded = added.map((tx: any) => {
        const amount = tx.amount;
        let roundup = 0;
        if (amount > 0) {
          if (amount % 1 === 0) roundup = 1.00;
          else roundup = Number((Math.ceil(amount) - amount).toFixed(2));
        }
        if (!isBaseline && amount > 0) addedRoundupsCents += Math.round(roundup * 100);
        return {
          id: tx.transaction_id,
          date: tx.date || '',
          merchant_name: tx.name || tx.merchant_name || tx.original_description || 'Unknown merchant',
          amount, roundup, isBaseline
        };
      });

      const formattedModified = modified.map((tx: any) => {
        const amount = tx.amount;
        let roundup = 0;
        if (amount > 0) {
          if (amount % 1 === 0) roundup = 1.00;
          else roundup = Number((Math.ceil(amount) - amount).toFixed(2));
        }
        return {
          id: tx.transaction_id,
          date: tx.date || '',
          merchant_name: tx.name || tx.merchant_name || tx.original_description || 'Unknown merchant',
          amount, roundup, isBaseline
        };
      });

      await saveTransactions(item.itemId, [...formattedAdded, ...formattedModified]);
      
      if (removed.length > 0) {
        await removeTransactions(item.itemId, removed.map((tx: any) => tx.transaction_id));
      }
    }

    const baselineReady = isBaseline && !hasMore;
    await applyPlaidSyncCursor(item.itemId, currentCursor, baselineReady);
    
    console.log(`Finished sync for ${item.itemId}. Added ${addedRoundupsCents / 100} to pending.`);
    
    // Evaluate if we should automatically trigger a withdrawal
    applyNewRoundupsAndEvaluateWithdrawal(item.itemId, addedRoundupsCents, "plaid_sync").catch(err => console.error('evaluateRoundupWithdrawal error:', err));
    
    return item;
  }

  async function applyNewRoundupsAndEvaluateWithdrawal(itemId: string, addedRoundupsCents: number, source: string) {
    const diag: any = {
      evaluated: true,
      stripeCustomerExists: false,
      achPaymentMethodExists: false,
      thresholdReached: false,
      reservationCreated: false,
      reservationId: null,
      balanceBefore: null,
      balanceAfter: null,
      stripeAttempted: false,
      paymentIntentId: null,
      stripeStatus: null,
      stripeError: null,
      rollbackPerformed: false,
      addedRoundupsCents,
      source
    };

    let reservedAmountCents = 0;
    let reservationId = '';

    try {
      const savedStripe = await getFirstStripeCustomer();
      diag.stripeCustomerExists = !!savedStripe;
      diag.achPaymentMethodExists = !!savedStripe?.paymentMethodId;
      
      if (!db) return diag;
      
      await runTransaction(db, async (t) => {
         const itemRef = doc(db, 'plaid_items', itemId);
         const itemSnap = await t.get(itemRef);
         if (!itemSnap.exists()) return;
         const data = itemSnap.data();
         
         const currentPendingCents = Math.round((data.pendingRoundupBalance || 0) * 100);
         const currentProcessingCents = Math.round((data.processingBalance || 0) * 100);
         
         diag.balanceBefore = currentPendingCents;
         const updatedPendingCents = currentPendingCents + addedRoundupsCents;
         
         if (updatedPendingCents < 500 || !savedStripe || !savedStripe.paymentMethodId) {
             diag.thresholdReached = false;
             t.update(itemRef, {
                 pendingRoundupBalance: updatedPendingCents / 100
             });
             diag.balanceAfter = updatedPendingCents;
             return;
         }
         
         diag.thresholdReached = true;
         reservedAmountCents = updatedPendingCents;
         diag.reservedAmountCents = reservedAmountCents;
         reservationId = 'res_' + Date.now() + '_' + Math.random().toString(36).substring(7);
         
         t.update(itemRef, {
             pendingRoundupBalance: 0,
             processingBalance: (currentProcessingCents + reservedAmountCents) / 100
         });
         
         const resRef = doc(db, 'reservations', reservationId);
         t.set(resRef, { amount: reservedAmountCents, createdAt: new Date().toISOString() });
      });

      if (!reservationId || reservedAmountCents === 0) {
         return diag;
      }
      
      diag.reservationCreated = true;
      diag.reservationId = reservationId;
      diag.balanceAfter = 0;

      const stripe = getStripe();
      diag.stripeAttempted = true;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: reservedAmountCents,
        currency: 'usd',
        payment_method_types: ['us_bank_account'],
        customer: savedStripe.customerId,
        payment_method: savedStripe.paymentMethodId,
        confirm: true,
        off_session: true,
        metadata: {
          donation_type: 'roundup_withdrawal',
          reservation_id: reservationId,
          reserved_amount_cents: reservedAmountCents.toString(),
          item_id: itemId,
          source: source
        }
      }, { idempotencyKey: reservationId });
      
      diag.paymentIntentId = paymentIntent.id;
      diag.stripeStatus = paymentIntent.status;

      await saveDonation(paymentIntent.id, {
        paymentIntentId: paymentIntent.id,
        reservationId,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        type: 'roundup_withdrawal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return diag;
    } catch (e: any) {
      if (e.message !== "Insufficient") {
        console.error('Error in applyNewRoundupsAndEvaluateWithdrawal:', e);
        if (reservationId) {
          try {
            await rollbackReservationFunds(itemId, reservationId);
            diag.rollbackPerformed = true;
          } catch (rollbackErr) {
            console.error('Failed to rollback reservation:', rollbackErr);
          }
        }
      }
      diag.stripeError = { code: e.raw?.code || e.raw?.type, message: e.raw?.message || e.message };
      return diag;
    }
  }

  // Endpoint to handle Plaid webhooks
  app.post('/api/plaid/webhook', async (req, res) => {
    const event = req.body;
    console.log('Received Plaid webhook:', event);
    res.sendStatus(200); // Always respond 200 to Plaid

    try {
      if (event.item_id) {
        await saveWebhookEvent(event.item_id, event);
        
        if (event.webhook_type === 'TRANSACTIONS' && event.webhook_code === 'SYNC_UPDATES_AVAILABLE') {
          console.log(`Processing SYNC_UPDATES_AVAILABLE for Item ${event.item_id}`);
          await performTransactionsSync(event.item_id);
        }
      }
    } catch (err: any) {
      console.error('Error processing webhook:', err.message);
    }
  });

  app.post('/api/force_sync', async (req, res) => {
    try {
      const { item_id } = req.body;
      if (!item_id) return res.status(400).json({ error: 'item_id required' });
      await performTransactionsSync(item_id);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error in force sync:', err.message);
      res.status(500).json({ error: 'Failed to sync' });
    }
  });

  app.post('/api/stripe/setup_intent', async (req, res) => {
    try {
      const stripe = getStripe();
      
      let customerId;
      const existing = await getFirstStripeCustomer();
      if (existing && existing.customerId) {
        customerId = existing.customerId;
      } else {
        const customer = await stripe.customers.create({
          description: 'Sadaqa Box modern ACH User',
        });
        customerId = customer.id;
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['us_bank_account'],
      });

      res.json({ clientSecret: setupIntent.client_secret, customerId });
    } catch (error: any) {
      console.error('Error creating SetupIntent:', error.message);
      res.status(500).json({ error: 'Failed to create SetupIntent', details: error.message });
    }
  });

  app.post('/api/stripe/save_payment_method', async (req, res) => {
    try {
      const { paymentMethodId, customerId } = req.body;
      const stripe = getStripe();
      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      if (!pm || !pm.us_bank_account) {
        return res.status(400).json({ error: 'Invalid payment method or not a US Bank Account' });
      }

      await saveStripeCustomer('current_user', {
        customerId: customerId,
        paymentMethodId: paymentMethodId,
        bankName: pm.us_bank_account.bank_name,
        accountType: pm.us_bank_account.account_type,
        mask: pm.us_bank_account.last4,
      });

      // trigger eval
      try {
        const items = await getAllPlaidItems();
        items.sort((a: any, b: any) => new Date(b.roundupsEnabledAt).getTime() - new Date(a.roundupsEnabledAt).getTime());
        const activeItem = items[0] as any;
        if (activeItem) {
          applyNewRoundupsAndEvaluateWithdrawal(activeItem.itemId, 0, "ach_connected").catch(err => console.error('evaluate after save ACH err:', err));
        }
      } catch (e) {
        console.error('Failed to trigger withdrawal on ACH connect', e);
      }

      res.json({ success: true, bankName: pm.us_bank_account.bank_name, mask: pm.us_bank_account.last4 });
    } catch (error: any) {
      console.error('Error saving Payment Method:', error.message);
      res.status(500).json({ error: 'Failed to save Payment Method', details: error.message });
    }
  });

  app.post('/api/stripe/create_donation', async (req, res) => {
    try {
      const stripe = getStripe();
      const saved = await getFirstStripeCustomer();
      if (!saved || !saved.paymentMethodId) {
        return res.status(400).json({ error: 'No ACH modern payment method linked yet.' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 100, // $1
        currency: 'usd',
        payment_method_types: ['us_bank_account'],
        customer: saved.customerId,
        payment_method: saved.paymentMethodId,
        confirm: true,
        off_session: true,
      });

      await saveDonation(paymentIntent.id, {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
        type: 'direct',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      res.json({ success: true, paymentIntentId: paymentIntent.id, status: paymentIntent.status });
    } catch (error: any) {
      console.error('Error creating donation:', error.message);
      let details: any = {};
      if (error.raw) {
        details = {
          errorCode: error.raw.code || error.raw.type,
          errorMessage: error.raw.message,
          requestId: error.raw.request_id,
        };
      } else {
        details = { errorMessage: error.message };
      }
      res.status(500).json({ error: 'Failed to process modern ACH donation', details });
    }
  });

  app.post('/api/stripe/simulate_roundup', async (req, res) => {
    try {
      const { amount } = req.body;
      const amountCents = Math.round(Number(amount) * 100);
      const items = await getAllPlaidItems();
      items.sort((a: any, b: any) => new Date(b.roundupsEnabledAt).getTime() - new Date(a.roundupsEnabledAt).getTime());
      const activeItem = items[0] as any;
      if (!activeItem) return res.status(400).json({ error: 'No active bank item' });
      
      const diag = await applyNewRoundupsAndEvaluateWithdrawal(activeItem.itemId, amountCents, "sandbox_test");
      
      const finalItem = await getPlaidItem(activeItem.itemId);
      if (diag) {
         diag.finalPendingBalance = finalItem?.pendingRoundupBalance || 0;
         diag.finalProcessingBalance = finalItem?.processingBalance || 0;
         
         const donations = await getAllDonations() as any[];
         diag.numProcessingReservations = donations.filter((d: any) => d.type === 'roundup_withdrawal' && (d.status === 'processing' || d.status === 'requires_action')).length;
      }

      res.json({ success: true, diag });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to simulate roundup', details: error.message });
    }
  });

  app.get('/api/stripe/donations', async (req, res) => {
    try {
      const donations = await getAllDonations() as any[];
      // sort by created date descending
      donations.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.json({ donations });
    } catch(err) {
      res.status(500).json({ error: 'Failed to fetch donations' });
    }
  });

  app.post('/api/stripe/refresh_donations', async (req, res) => {
    try {
      const stripe = getStripe();
      const donations = await getAllDonations() as any[];
      const processing = donations.filter((d: any) => d.status === 'processing' || d.status === 'requires_action');
      
      for (const don of processing) {
        const pi = await stripe.paymentIntents.retrieve(don.paymentIntentId);
        let errorDetails = null;
        if (pi.status === 'requires_payment_method' && pi.last_payment_error) {
           errorDetails = {
             code: pi.last_payment_error.code,
             message: pi.last_payment_error.message,
           };
        } else if (pi.status === 'processing' && pi.last_payment_error) {
           errorDetails = { code: pi.last_payment_error.code, message: pi.last_payment_error.message };
        }
        
        await saveDonation(pi.id, {
          status: pi.status === 'requires_payment_method' ? 'payment_failed' : pi.status, // normalise failed state visually
          updatedAt: new Date().toISOString(),
          errorDetails
        });
      }
      const updated = await getAllDonations() as any[];
      updated.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.json({ donations: updated });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to refresh donations' });
    }
  });

  app.post('/api/stripe/reset_ach', async (req, res) => {
    try {
      await clearStripeCustomer();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reset ACH account' });
    }
  });

  app.get('/api/stripe/config', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY });
  });

  app.get('/api/stripe/status', async (req, res) => {
    try {
      const saved = await getFirstStripeCustomer();
      const items = await getAllPlaidItems();
      items.sort((a: any, b: any) => new Date(b.roundupsEnabledAt).getTime() - new Date(a.roundupsEnabledAt).getTime());
      const activeItem = items[0] as any;
      
      const stats = {
         availableCents: activeItem ? Math.round((activeItem.pendingRoundupBalance || 0) * 100) : 0,
         processingCents: activeItem ? Math.round((activeItem.processingBalance || 0) * 100) : 0,
         successfulCents: activeItem ? Math.round((activeItem.successfulBalance || 0) * 100) : 0,
         failedCents: activeItem ? Math.round((activeItem.failedBalance || 0) * 100) : 0,
      };

      if (!saved) return res.json({ connected: false, stats });
      res.json({ 
        connected: !!saved.paymentMethodId, 
        bankName: saved.bankName, 
        mask: saved.mask, 
        accountType: saved.accountType, 
        customerId: saved.customerId,
        paymentMethodId: saved.paymentMethodId,
        stats
      });
    } catch(err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load Stripe status' });
    }
  });

  // Removes the getWebhookEvents endpoint that is no longer imported
  // It shouldn't be here since we didn't import it.
  app.post('/api/create_link_token', async (req, res) => {
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return res.status(400).json({ error: 'Plaid keys missing.' });
    }

    try {
      configuration = new Configuration({
        basePath: PlaidEnvironments.sandbox,
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
            'PLAID-SECRET': process.env.PLAID_SECRET || '',
          },
        },
      });
      plaidClient = new PlaidApi(configuration);

      const webhookHost = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
      const webhookProto = req.headers['x-forwarded-proto'] || 'https';
      const dynamicWebhook = `${webhookProto}://${webhookHost}/api/plaid/webhook`;

      const response = await plaidClient.linkTokenCreate({
        user: { client_user_id: 'test_user_id' },
        client_name: 'The Sadaqa Box Tester',
        products: [Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: dynamicWebhook,
      });
      res.json({ link_token: response.data.link_token });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create link token' });
    }
  });

  app.post('/api/set_access_token', async (req, res) => {
    const { publicToken } = req.body;
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
      
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;

      // Optimistically try to get institution and account mask
      let bankName = 'Unknown Bank';
      let mask = null;
      try {
        const itemResp = await plaidClient.itemGet({ access_token: accessToken });
        const institutionId = itemResp.data.item.institution_id;
        if (institutionId) {
          const instResp = await plaidClient.institutionsGetById({
            institution_id: institutionId,
            country_codes: [CountryCode.Us]
          });
          bankName = instResp.data.institution.name;
        }

        const accountsResp = await plaidClient.accountsGet({ access_token: accessToken });
        const primaryAccount = accountsResp.data.accounts.find(a => a.subtype === 'checking' || a.subtype === 'savings') || accountsResp.data.accounts[0];
        if (primaryAccount && primaryAccount.mask) {
           mask = primaryAccount.mask;
        }
      } catch(e) {
        console.error('Failed to augment item data', e);
      }

      await savePlaidItem(itemId, {
        itemId,
        accessToken,
        cursor: null,
        baselineStatus: 'loading',
        pendingRoundupBalance: 0,
        roundupsEnabledAt: new Date().toISOString(),
        bankName,
        mask
      });

      // In Sandbox, webhooks to local/preview environments might drop.
      // We automatically force a sync shortly after connect.
      if ((process.env.PLAID_ENV || 'sandbox') === 'sandbox') {
        setTimeout(() => {
          performTransactionsSync(itemId).catch(e => console.error('Auto-sync failed', e));
        }, 2000);
      }
      
      res.json({ 
        message: 'Access token set securely in backend', 
        item_id: itemId
      });
    } catch (error: any) {
      console.error('Error exchanging token:', error.message);
      res.status(500).json({ error: 'Failed to exchange public token' });
    }
  });

  app.get('/api/app_data', async (req, res) => {
    const isSandbox = (process.env.PLAID_ENV || 'sandbox') === 'sandbox';
    try {
      const items = await getAllPlaidItems();
      // For this app, assume we just use the most recently connected item
      if (items.length === 0) {
        return res.json({ connected: false, pendingRoundupBalance: 0, transactions: [], isSandbox });
      }

      items.sort((a: any, b: any) => new Date(b.roundupsEnabledAt).getTime() - new Date(a.roundupsEnabledAt).getTime());
      const activeItem = items[0] as any;
      const txs = await getSavedTransactions(activeItem.itemId);
      
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      res.json({
        connected: true,
        item_id: activeItem.itemId,
        baselineStatus: activeItem.baselineStatus,
        pendingRoundupBalance: activeItem.pendingRoundupBalance,
        transactions: txs,
        isSandbox,
        bankName: activeItem.bankName,
        mask: activeItem.mask
      });
    } catch (error: any) {
      console.error('Error fetching app data:', error.message);
      res.status(500).json({ error: 'Failed to fetch app data' });
    }
  });

  app.post('/api/simulate_purchase', async (req, res) => {
    if ((process.env.PLAID_ENV || 'sandbox') !== "sandbox") {
      return res.status(403).json({ error: 'Simulator disabled outside sandbox' });
    }
    
    try {
      const items = await getAllPlaidItems();
      if (items.length === 0) return res.status(400).json({ error: 'No connected bank' });
      
      items.sort((a: any, b: any) => new Date(b.roundupsEnabledAt).getTime() - new Date(a.roundupsEnabledAt).getTime());
      const activeItem = items[0] as any;

      const today = new Date().toISOString().split('T')[0];
      
      // Emulate the simulated transaction locally in Firestore since Plaid's sandboxTransactionsCreate 
      // ignores custom payloads when the item is created with user_transactions_dynamic.
      const mockTx = {
        id: 'sim_tx_' + Date.now() + Math.random().toString(36).substring(7),
        date: today,
        merchant_name: 'Sadaqa Box Test Coffee',
        amount: 4.25,
        roundup: 0.75,
        isBaseline: false
      };
      
      await saveTransactions(activeItem.itemId, [mockTx]);
      
      const diag = await applyNewRoundupsAndEvaluateWithdrawal(activeItem.itemId, Math.round(mockTx.roundup * 100), "simulate_purchase");

      // Attempt to fire webhook to trigger native generic sync as well, ignoring failure if blocked
      try {
        await plaidClient.sandboxItemFireWebhook({
          access_token: activeItem.accessToken,
          webhook_code: 'SYNC_UPDATES_AVAILABLE' as any
        });
      } catch (e) {
        // Fallback for user_custom which does support create but we already injected locally
      }

      res.json({ success: true, simulated_local: true, transaction: mockTx });
    } catch (error: any) {
      console.error('Error simulating purchase:', error.message);
      res.status(500).json({ error: 'Failed to simulate purchase' });
    }
  });

  app.post('/api/reset_roundups', async (req, res) => {
    if ((process.env.PLAID_ENV || 'sandbox') !== "sandbox") {
      return res.status(403).json({ error: 'Simulator disabled outside sandbox' });
    }
    
    try {
      const items = await getAllPlaidItems();
      if (items.length === 0) return res.status(400).json({ error: 'No connected bank' });
      
      items.sort((a: any, b: any) => new Date(b.roundupsEnabledAt).getTime() - new Date(a.roundupsEnabledAt).getTime());
      const activeItem = items[0] as any;

      // Reset balance
      activeItem.pendingRoundupBalance = 0;
      await savePlaidItem(activeItem.itemId, activeItem);

      // Delete ONLY simulated non-baseline transactions (added during sandbox testing)
      const txs = await getSavedTransactions(activeItem.itemId);
      const toDelete = txs.filter(t => t.isBaseline === false);
      
      if (toDelete.length > 0) {
        await removeTransactions(activeItem.itemId, toDelete.map(t => t.id));
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error resetting roundups:', error.message);
      res.status(500).json({ error: 'Failed to reset roundups' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
