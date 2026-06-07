import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function RoundupWithdrawalTester() {
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorObj, setErrorObj] = useState<{message: string, details?: any} | null>(null);

  const fetchStatsAndDonations = async () => {
    try {
      const [statusResp, donationsResp] = await Promise.all([
        fetch('/api/stripe/status'),
        fetch('/api/stripe/donations')
      ]);
      
      const statusData = await statusResp.json();
      const donationsData = await donationsResp.json();
      
      if (statusResp.ok) setStats(statusData.stats);
      if (donationsResp.ok) {
         const withdrawals = (donationsData.donations || []).filter((d: any) => d.type === 'roundup_withdrawal');
         setDonations(withdrawals);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    fetchStatsAndDonations();
    const interval = setInterval(fetchStatsAndDonations, 10000); 
    return () => clearInterval(interval);
  }, []);

  const [diag, setDiag] = useState<any>(null);
  const [testAmount, setTestAmount] = useState<string>('7.50');

  const simulateRoundup = async () => {
    setIsLoading(true);
    setErrorObj(null);
    setDiag(null);
    try {
       const resp = await fetch('/api/stripe/simulate_roundup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(testAmount) })
       });
       const data = await resp.json();
       if (!resp.ok) {
          setErrorObj({ message: data.error || 'Failed to simulate roundup', details: data.details });
       } else {
          setDiag(data.diag);
       }
       await fetchStatsAndDonations();
    } catch (err: any) {
       setErrorObj({ message: 'Network error.' });
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col shadow-sm mt-6">
       <div className="flex items-center gap-2 mb-6">
        <Wallet className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-slate-800">Roundup Withdrawal Tester</h2>
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded tracking-widest border border-slate-200">
          Stripe Test Mode
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col items-start col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">Available/Pending</span>
            <span className="text-3xl font-bold text-indigo-700">${((stats?.availableCents || 0) / 100).toFixed(2)}</span>
         </div>
         <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">Processing</span>
            <span className="text-xl font-medium text-amber-900">${((stats?.processingCents || 0) / 100).toFixed(2)}</span>
         </div>
         <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Succeeded</span>
            <span className="text-xl font-medium text-emerald-900">${((stats?.successfulCents || 0) / 100).toFixed(2)}</span>
         </div>
         <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 mb-1">Failed Restored</span>
            <span className="text-xl font-medium text-rose-900">${((stats?.failedCents || 0) / 100).toFixed(2)}</span>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
        <label className="text-sm font-medium text-slate-700">Add Test Roundup Amount</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(e.target.value)}
            step="0.01"
            className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            onClick={simulateRoundup}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            Simulate New Eligible Roundup
          </button>
        </div>
      </div>
      
      {diag && (
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Diagnostic Stages</h3>
          <ul className="text-sm space-y-2 font-mono text-slate-700 bg-white p-4 rounded border border-slate-200 shadow-sm">
            <li>Added roundup amount: ${(diag.addedRoundupsCents / 100).toFixed(2)}</li>
            <li>Source: {diag.source}</li>
            <li>ACH PaymentMethod exists: {diag.achPaymentMethodExists ? 'yes' : 'no'}</li>
            <li>Stripe Customer exists: {diag.stripeCustomerExists ? 'yes' : 'no'}</li>
            <li>Balance before increment: ${(diag.balanceBefore / 100).toFixed(2)}</li>
            <li>Threshold reached: {diag.thresholdReached ? 'yes' : 'no'}</li>
            <li>Dynamically reserved amount: {diag.reservedAmountCents ? `$${(diag.reservedAmountCents / 100).toFixed(2)}` : 'none'}</li>
            <li>Reservation ID: {diag.reservationId || 'N/A'}</li>
            <li>Balance after increment/reservation: ${(diag.balanceAfter / 100).toFixed(2)}</li>
            <li>Stripe PaymentIntent ID: {diag.paymentIntentId || 'N/A'}</li>
            <li>Stripe status: {diag.stripeStatus || 'N/A'}</li>
            <li>Stripe safe error: {diag.stripeError ? `${diag.stripeError.code}: ${diag.stripeError.message}` : 'none'}</li>
            <li>Final pending balance: ${(diag.finalPendingBalance / 100).toFixed(2)}</li>
            <li>Final processing balance: ${(diag.finalProcessingBalance / 100).toFixed(2)}</li>
            <li>Processing reservations: {diag.numProcessingReservations || 0}</li>
          </ul>
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
               {errorObj.details.errorCode && <div>Code: {errorObj.details.errorCode}</div>}
               {errorObj.details.errorMessage && <div>Message: {errorObj.details.errorMessage}</div>}
             </div>
           )}
        </div>
      )}

      {donations.length > 0 && (
         <div className="mt-8 border-t border-slate-100 pt-6">
           <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Roundup Withdrawal History</h3>
           <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-sm">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200">
                   <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                   <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                   <th className="px-4 py-3 font-semibold text-slate-600">Amount</th>
                   <th className="px-4 py-3 font-semibold text-slate-600">Stripe ID</th>
                   <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {donations.map((don, idx) => {
                    const dDate = don.createdAt ? new Date(don.createdAt).toLocaleString() : '-';
                    const isProcessing = ['processing', 'requires_action'].includes(don.status);
                    const isSuccess = don.status === 'succeeded';
                    const isFailed = don.status === 'payment_failed';
                    return (
                      <tr key={don.paymentIntentId || Math.random()} className={`border-b border-slate-100 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                         <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{dDate}</td>
                         <td className="px-4 py-3 text-indigo-700 font-medium">Roundup Withdrawal</td>
                         <td className="px-4 py-3 text-slate-900 font-semibold">${(don.amount / 100).toFixed(2)}</td>
                         <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[150px] truncate">{don.paymentIntentId || don.reservationId}</td>
                         <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                               isSuccess ? 'bg-emerald-100 text-emerald-800' :
                               isFailed ? 'bg-rose-100 text-rose-800' :
                               'bg-amber-100 text-amber-800'
                            }`}>
                              {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                              {isFailed && <XCircle className="w-3 h-3" />}
                              {isProcessing && <Clock className="w-3 h-3" />}
                              {isProcessing ? 'Processing' : 
                               isSuccess ? 'Succeeded' : 
                               isFailed ? 'Failed — balance restored' : 
                               don.status}
                            </span>
                         </td>
                      </tr>
                    )
                 })}
               </tbody>
             </table>
           </div>
         </div>
      )}
    </div>
  );
}
