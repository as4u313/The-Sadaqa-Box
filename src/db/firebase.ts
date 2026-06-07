import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, runTransaction, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let db: ReturnType<typeof getFirestore>;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = initializeApp(config);
    db = getFirestore(app, config.firestoreDatabaseId);
    console.log('Firebase initialized in server.');
  } else {
    console.warn('firebase-applet-config.json not found. Firebase will not be available.');
  }
} catch (e) {
  console.error('Error initializing Firebase on server:', e);
}

export { db };

// Helper to set item state
export async function savePlaidItem(itemId: string, data: any) {
  if (!db) return;
  await setDoc(doc(db, 'plaid_items', itemId), data, { merge: true });
}

export async function getPlaidItem(itemId: string) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'plaid_items', itemId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getAllPlaidItems() {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'plaid_items'));
  return snapshot.docs.map(d => ({ itemId: d.id, ...d.data() }));
}

export async function saveTransactions(itemId: string, txs: any[]) {
  if (!db || txs.length === 0) return;
  
  // Use a transaction or batch to save them sequentially or batched
  // For simplicity, sequential sets here (sandbox scale)
  for (const tx of txs) {
    if (!tx.id) continue;
    await setDoc(doc(db, 'plaid_items', itemId, 'transactions', tx.id), {
      ...tx,
      itemId
    }, { merge: true });
  }
}

export async function removeTransactions(itemId: string, removedTxIds: string[]) {
  if (!db || removedTxIds.length === 0) return;
  for (const id of removedTxIds) {
    if (!id) continue;
    await deleteDoc(doc(db, 'plaid_items', itemId, 'transactions', id));
  }
}

export async function getSavedTransactions(itemId: string) {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'plaid_items', itemId, 'transactions'));
  return snapshot.docs.map(d => d.data());
}

export async function saveWebhookEvent(itemId: string, event: any) {
  if (!db) return;
  const eventId = `${event.webhook_code}_${Date.now()}`;
  await setDoc(doc(db, 'plaid_items', itemId, 'webhooks', eventId), {
    ...event,
    processedAt: Date.now()
  });
}

export async function saveStripeCustomer(customerId: string, data: any) {
  if (!db) return;
  await setDoc(doc(db, 'stripe_customers', customerId), data, { merge: true });
}

export async function getStripeCustomer(customerId: string) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'stripe_customers', customerId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getFirstStripeCustomer(): Promise<any | null> {
  if (!db) return null;
  const snapshot = await getDocs(collection(db, 'stripe_customers'));
  if (snapshot.docs.length > 0) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
}

export async function clearStripeCustomer() {
  if (!db) return;
  const snapshot = await getDocs(collection(db, 'stripe_customers'));
  const batchReqs = snapshot.docs.map(d => deleteDoc(doc(db, 'stripe_customers', d.id)));
  await Promise.all(batchReqs);
}

export async function saveDonation(paymentIntentId: string, data: any) {
  if (!db) return;
  await setDoc(doc(db, 'donations', paymentIntentId), data, { merge: true });
}

export async function getDonation(paymentIntentId: string) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'donations', paymentIntentId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getAllDonations() {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'donations'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveReservation(id: string, data: any) {
  if (!db) return;
  await setDoc(doc(db, 'reservations', id), data);
}

export async function getReservation(id: string) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, 'reservations', id));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getActiveReservations() {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, 'reservations'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteReservation(id: string) {
  if (!db) return;
  await deleteDoc(doc(db, 'reservations', id));
}

export async function reserveAllAvailableRoundupFunds(itemId: string, reservationId: string) {
  if (!db) return 0;
  let reservedCents = 0;
  await runTransaction(db, async (t) => {
    const itemRef = doc(db, 'plaid_items', itemId);
    const itemSnap = await t.get(itemRef);
    if (!itemSnap.exists()) return;
    const data = itemSnap.data();

    const availableCents = Math.round((data.pendingRoundupBalance || 0) * 100);
    if (availableCents < 500) return;

    const processingCents = Math.round((data.processingBalance || 0) * 100);
    
    t.update(itemRef, {
      pendingRoundupBalance: 0,
      processingBalance: (processingCents + availableCents) / 100
    });

    const resRef = doc(db, 'reservations', reservationId);
    t.set(resRef, { amount: availableCents, createdAt: new Date().toISOString() });

    reservedCents = availableCents;
  });
  return reservedCents;
}

export async function rollbackReservationFunds(itemId: string, reservationId: string) {
  if (!db) return;
  await runTransaction(db, async (t) => {
    const resRef = doc(db, 'reservations', reservationId);
    const resSnap = await t.get(resRef);
    if (!resSnap.exists()) return;
    const amountCents = resSnap.data().amount || 0;

    const itemRef = doc(db, 'plaid_items', itemId);
    const itemSnap = await t.get(itemRef);
    if (!itemSnap.exists()) {
      t.update(resRef, { status: 'failed_to_create' });
      return;
    }
    const data = itemSnap.data();

    const processingCents = Math.round((data.processingBalance || 0) * 100);
    const availableCents = Math.round((data.pendingRoundupBalance || 0) * 100);

    t.update(itemRef, {
      pendingRoundupBalance: (availableCents + amountCents) / 100,
      processingBalance: Math.max(0, processingCents - amountCents) / 100
    });

    t.update(resRef, { status: 'failed_to_create' });
  });
}

export async function resetRoundupTestState(itemId: string) {
  if (!db) return;
  await setDoc(doc(db, 'plaid_items', itemId), {
    pendingRoundupBalance: 5.75,
    processingBalance: 0,
    successfulBalance: 0,
    failedBalance: 0
  }, { merge: true });
}

export async function cancelPriorRoundupWithdrawals() {
  if (!db) return;
  const snapshot = await getDocs(collection(db, 'donations'));
  const batch = writeBatch(db);
  let count = 0;
  snapshot.docs.forEach((d) => {
    if (d.data().type === 'roundup_withdrawal') {
      batch.update(d.ref, { status: 'canceled' });
      count++;
    }
  });
  if (count > 0) {
    await batch.commit();
  }
}

export async function applyPlaidSyncCursor(itemId: string, cursor: string | undefined, isBaselineReady: boolean) {
  if (!db) return;
  await runTransaction(db, async (t) => {
    const itemRef = doc(db, 'plaid_items', itemId);
    const itemSnap = await t.get(itemRef);
    if (!itemSnap.exists()) return;

    const updates: any = {
      cursor: cursor
    };
    if (isBaselineReady) {
      updates.baselineStatus = 'ready';
    }

    t.update(itemRef, updates);
  });
}
export async function processWebhookBalanceUpdate(itemId: string, amountCents: number, eventType: 'succeeded' | 'failed') {
  if (!db) return;
  await runTransaction(db, async (t) => {
    const itemRef = doc(db, 'plaid_items', itemId);
    const itemSnap = await t.get(itemRef);
    if (!itemSnap.exists()) return;
    const data = itemSnap.data();

    const processingCents = Math.round((data.processingBalance || 0) * 100);
    const availableCents = Math.round((data.pendingRoundupBalance || 0) * 100);
    const successfulCents = Math.round((data.successfulBalance || 0) * 100);
    const failedCents = Math.round((data.failedBalance || 0) * 100);

    const newProcessingCents = Math.max(0, processingCents - amountCents);

    if (eventType === 'succeeded') {
      t.update(itemRef, {
        processingBalance: newProcessingCents / 100,
        successfulBalance: (successfulCents + amountCents) / 100
      });
    } else { // failed
      t.update(itemRef, {
        processingBalance: newProcessingCents / 100,
        pendingRoundupBalance: (availableCents + amountCents) / 100,
        failedBalance: (failedCents + amountCents) / 100
      });
    }
  });
}

