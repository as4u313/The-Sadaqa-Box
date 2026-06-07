import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Loader2, Plus, DollarSign, Building, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

export function StripeACHTester({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [bankInfo, setBankInfo] = useState<{bankName: string, accountType: string, mask: string, customerId: string, paymentMethodId: string} | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorObj, setErrorObj] = useState<{message: string, details?: any} | null>(null);
  const [donationStatus, setDonationStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stripe/config')
      .then(res => res.json())
      .then(data => {
        if (data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
      })
      .catch(err => console.error('Failed config fetch', err));

    fetchStatus();
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const resp = await fetch('/api/stripe/donations');
      const data = await resp.json();
      if (resp.ok) {
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('Failed to fetch donations', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const resp = await fetch('/api/stripe/status');
      const data = await resp.json();
      if (resp.ok) {
        setIsConnected(data.connected);
        if (data.connected && data.paymentMethodId) {
          setBankInfo({ 
            bankName: data.bankName, 
            mask: data.mask, 
            accountType: data.accountType, 
            customerId: data.customerId,
            paymentMethodId: data.paymentMethodId
          });
        }
      }
    } catch (err) {
      console.error('Error fetching Stripe status', err);
    }
  };

  const simulateDonation = async () => {
    setIsDonating(true);
    setErrorObj(null);
    setDonationStatus(null);
    try {
      const resp = await fetch('/api/stripe/create_donation', { method: 'POST' });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorObj({ message: data.error || 'Failed to process test donation', details: data.details });
        setIsDonating(false);
        return;
      }
      setDonationStatus(`Success! Payment Intent ${data.paymentIntentId} created. Note: ACH payments remain 'processing' for several days normally.`);
      await fetchDonations();
    } catch (err) {
      setErrorObj({ message: 'Network error while creating donation' });
    } finally {
      setIsDonating(false);
    }
  };

  const refreshDonations = async () => {
     setIsRefreshing(true);
     setErrorObj(null);
     try {
       const resp = await fetch('/api/stripe/refresh_donations', { method: 'POST' });
       const data = await resp.json();
       if (resp.ok) {
         setDonations(data.donations || []);
       } else {
         setErrorObj({ message: data.error || 'Failed to refresh donations' });
       }
     } catch (err) {
       setErrorObj({ message: 'Network error during refresh' });
     } finally {
       setIsRefreshing(false);
     }
  };

  const resetAccount = async () => {
    setIsResetting(true);
    setErrorObj(null);
    try {
       const resp = await fetch('/api/stripe/reset_ach', { method: 'POST' });
       if (resp.ok) {
         setBankInfo(null);
         setIsConnected(false);
         setDonationStatus('Test account disconnected.');
         setTimeout(() => setDonationStatus(null), 3000);
       } else {
         const data = await resp.json();
         setErrorObj({ message: data.error || 'Failed to reset account' });
       }
    } catch (err) {
       setErrorObj({ message: 'Network error during reset' });
    } finally {
       setIsResetting(false);
    }
  };

  const connectACH = async () => {
    if (!stripePromise) return;
    const stripe = await stripePromise;
    if (!stripe) return;

    setIsLoading(true);
    setErrorObj(null);
    setDonationStatus(null);

    try {
      // 1. Get SetupIntent
      const intentResp = await fetch('/api/stripe/setup_intent', { method: 'POST' });
      const intentData = await intentResp.json();
      if (!intentResp.ok) {
        throw new Error(intentData.error || 'Failed to create SetupIntent');
      }

      const { clientSecret, customerId } = intentData;

      // 2. Collect Bank Account
      const { setupIntent, error: collectError } = await stripe.collectBankAccountForSetup({
        clientSecret,
        params: {
          payment_method_type: 'us_bank_account',
          payment_method_data: {
            billing_details: {
              name: 'Test Donor',
              email: 'donor@example.com',
            },
          },
        },
        expand: ['payment_method'],
      });

      if (collectError) {
        throw { 
           message: collectError.message, 
           details: { step: 'collect_bank_account', errorCode: collectError.code } 
        };
      }

      // 3. Confirm Setup
      if (setupIntent && setupIntent.status === 'requires_confirmation') {
        const { setupIntent: confirmedIntent, error: confirmError } = await stripe.confirmUsBankAccountSetup(clientSecret);
        if (confirmError) {
          throw {
            message: confirmError.message,
            details: { step: 'confirm_setup_intent', errorCode: confirmError.code }
          };
        }

        // 4. Save Payment Method to Backend
        const paymentMethodId = typeof confirmedIntent?.payment_method === 'string' 
           ? confirmedIntent.payment_method 
           : confirmedIntent?.payment_method?.id;

        if (paymentMethodId) {
          const saveResp = await fetch('/api/stripe/save_payment_method', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentMethodId, customerId })
          });
          const saveData = await saveResp.json();
          if (!saveResp.ok) throw new Error(saveData.error);
          
          setDonationStatus('Modern ACH Bank linked successfully!');
          await fetchStatus();
          setTimeout(() => setDonationStatus(null), 3000);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorObj({ 
        message: err.message || 'ACH connection failed', 
        details: err.details 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Building className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-800">ACH Donation Account Tester</h2>
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded tracking-widest border border-slate-200">
          Stripe ACH Test Mode
        </span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-6">
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
             ACH Donation Account Connected: {isConnected ? <span className="text-emerald-600">Yes</span> : <span className="text-slate-500">No</span>}
          </div>
          {isConnected && bankInfo ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Connected Account</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Stripe SetupIntent Confirmed</span>
              </div>
              <div className="text-lg font-medium text-slate-900">{bankInfo.bankName}</div>
              <div className="text-slate-500 text-sm mt-1 uppercase">{bankInfo.accountType} •••• {bankInfo.mask}</div>
              <div className="text-slate-400 text-xs mt-3 flex flex-col gap-1 font-mono">
                <div>Customer ID: {bankInfo.customerId}</div>
                <div>PM ID: {bankInfo.paymentMethodId}</div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">
              <p className="mb-2">Link a checking or savings account via Stripe Financial Connections to save it securely as a modern us_bank_account payment method.</p>
              <p>Creates a Stripe SetupIntent directly without Plaid legacy access tokens.</p>
            </div>
          )}

          <div className="mt-6 space-y-2">
            {!isEmbedded && <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Testing Instructions</h3>}
            <ul className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 border border-slate-100 rounded-xl">
               <li className="flex gap-2">
                  <ArrowRight className="w-3 h-3 mt-0.5 text-indigo-400 shrink-0" />
                  <span>For a normal connected state, connect a <strong>success test account</strong>.</span>
               </li>
               {!isEmbedded && (
                 <>
                   <li className="flex gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5 text-indigo-400 shrink-0" />
                      <span>For an indefinitely processing test, use the <strong>processing test account</strong>.</span>
                   </li>
                   <li className="flex gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5 text-indigo-400 shrink-0" />
                      <span>For failure testing, connect a <strong>failure test account</strong>.</span>
                   </li>
                 </>
               )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 min-w-[240px]">
          {!isConnected && (
            <button
              onClick={connectACH}
              disabled={!stripePromise || isLoading}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {(!stripePromise || isLoading) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Building className="w-4 h-4" />
              )}
              Connect ACH Donation Account
            </button>
          )}
          
          {isConnected && !isEmbedded && (
            <>
              <button
                onClick={simulateDonation}
                disabled={isDonating || isLoading || !isConnected}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isDonating ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4 text-white" />}
                Create $1 Test Donation
              </button>
              
              <button
                onClick={resetAccount}
                disabled={isResetting || isLoading}
                className="w-full px-6 py-3 bg-white border border-rose-200 text-rose-700 font-semibold rounded-xl hover:bg-rose-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Reset ACH Test Account
              </button>
            </>
          )}
        </div>
      </div>

      {donations.length > 0 && !isEmbedded && (
         <div className="mt-8">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Test Donations</h3>
              <button 
                onClick={refreshDonations} 
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                 {isRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                 Refresh Donation Status
              </button>
           </div>
           
           <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-sm">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200">
                   <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                   <th className="px-4 py-3 font-semibold text-slate-600">Amount</th>
                   <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                   <th className="px-4 py-3 font-semibold text-slate-600">Details</th>
                 </tr>
               </thead>
               <tbody>
                 {donations.map((don, idx) => (
                    <tr key={don.paymentIntentId} className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                       <td className="px-4 py-3 font-mono text-xs text-slate-500 w-1/4 break-all">{don.paymentIntentId}</td>
                       <td className="px-4 py-3 text-slate-700">${(don.amount / 100).toFixed(2)}</td>
                       <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                             don.status === 'succeeded' ? 'bg-emerald-100 text-emerald-800' :
                             don.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                             don.status === 'requires_action' ? 'bg-amber-100 text-amber-800' :
                             'bg-rose-100 text-rose-800'
                          }`}>
                            {don.status}
                          </span>
                       </td>
                       <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate">
                          {don.errorDetails ? don.errorDetails.message || don.errorDetails.code : '-'}
                       </td>
                    </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
      )}

      {errorObj && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-800 rounded-lg text-sm font-medium flex flex-col gap-2">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>
             {errorObj.message}
           </div>
           {errorObj.details && (
             <div className="ml-4 p-2 bg-red-100/50 rounded font-mono text-xs text-red-900">
               {errorObj.details.step && <div>Step: {errorObj.details.step}</div>}
               {errorObj.details.errorCode && <div>Code: {errorObj.details.errorCode}</div>}
               {errorObj.details.errorMessage && <div>Message: {errorObj.details.errorMessage}</div>}
             </div>
           )}
        </div>
      )}

      {donationStatus && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-sm font-medium flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
           {donationStatus}
        </div>
      )}
    </div>
  );
}
