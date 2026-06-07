import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Plus, Loader2, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  item_id: string;
  date: string;
  merchant_name: string;
  amount: number;
  roundup: number;
  isBaseline?: boolean;
}

export function BankTester({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalRoundups, setTotalRoundups] = useState<number>(0);
  const [baselineStatus, setBaselineStatus] = useState<string>('loading');
  const [isSandbox, setIsSandbox] = useState<boolean>(false);
  const [bankInfo, setBankInfo] = useState<{bankName: string, mask: string} | null>(null);

  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Fetch link token from our server
  const generateToken = async () => {
    try {
      const response = await fetch('/api/create_link_token', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.link_token) {
        setLinkToken(data.link_token);
      } else {
        setTokenError(data.error || 'Failed to create link token');
      }
    } catch (error) {
      setTokenError('Network error while generating link token');
    }
  };

  useEffect(() => {
    generateToken();
    fetchAppData();
  }, []);

  const fetchAppData = async () => {
    setIsLoadingTx(true);
    setTxError(null);
    try {
      const resp = await fetch('/api/app_data');
      const data = await resp.json();
      if (resp.ok) {
        setIsConnected(data.connected);
        setIsSandbox(!!data.isSandbox);
        if (data.connected) {
          setItemId(data.item_id);
          setBaselineStatus(data.baselineStatus);
          setTotalRoundups(data.pendingRoundupBalance);
          setTransactions(data.transactions || []);
          if (data.bankName) {
            setBankInfo({ bankName: data.bankName, mask: data.mask });
          }
        }
      } else {
        setTxError(data.error || 'Failed to fetch application data');
      }
    } catch (err) {
      setTxError('Network error while fetching app data');
    } finally {
      setIsLoadingTx(false);
    }
  };

  const handleResetRoundups = async () => {
    setIsResetting(true);
    setTxError(null);
    try {
      const resp = await fetch('/api/reset_roundups', { method: 'POST' });
      if (resp.ok) {
        setSyncMessage('Simulated roundup balance reset.');
        await fetchAppData();
        setTimeout(() => setSyncMessage(null), 3000);
      } else {
        const data = await resp.json();
        setTxError(data.error || 'Failed to reset roundups');
      }
    } catch (err) {
      setTxError('Network error while resetting');
    } finally {
      setIsResetting(false);
    }
  };

  const handleRefresh = async () => {
    if (itemId) {
      setIsLoadingTx(true);
      try {
        await fetch('/api/force_sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_id: itemId })
        });
      } catch (e) {
        console.error('Force sync failed', e);
      }
    }
    await fetchAppData();
  };

  const simulatePurchase = async () => {
    setIsSimulating(true);
    setTxError(null);
    try {
      const resp = await fetch('/api/simulate_purchase', { method: 'POST' });
      const data = await resp.json();
      if (!resp.ok) {
        setTxError(data.error || 'Failed to simulate purchase');
        setIsSimulating(false);
        return;
      }

      setSyncMessage('Purchase simulated successfully!');
      
      // Refresh once after backend locally simulates it
      setTimeout(() => {
        handleRefresh();
        setTimeout(() => setSyncMessage(null), 3000);
      }, 1000);

    } catch (err) {
      setTxError('Network error while simulating purchase');
    } finally {
      setIsSimulating(false);
    }
  };

  const onSuccess = useCallback(async (public_token: string) => {
    try {
      const response = await fetch('/api/set_access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken: public_token }),
      });
      if (response.ok) {
        setSyncMessage('Bank connected! Setting up initial baseline...');
        // Refresh app state
        await fetchAppData();
        setTimeout(() => setSyncMessage(null), 3000);

      } else {
        const data = await response.json();
        setTxError(data.error || 'Failed to exchange public token');
      }
    } catch (error) {
      setTxError('Network error during token exchange');
    }
  }, []);

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
    env: 'sandbox',
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-stretch gap-6 shadow-sm">
        <div className="flex flex-col flex-1">
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total Pending Roundup Balance</h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-light text-slate-900">${totalRoundups.toFixed(2)}</span>
            {syncMessage && <span className="text-emerald-600 text-sm font-bold ml-2">{syncMessage}</span>}
          </div>
          
          <div className="mt-auto w-full max-w-md">
            <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
              <span>Goal Progress</span>
              <span>${Math.min(totalRoundups, 5).toFixed(2)} / $5.00</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${totalRoundups >= 5 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                style={{ width: `${Math.min((totalRoundups / 5) * 100, 100)}%` }}
              ></div>
            </div>
            {totalRoundups >= 5 && (
              <div className="mt-2 text-emerald-600 text-xs font-bold tracking-wide">
                MILK THE COW! GOAL REACHED! 🎉
              </div>
            )}
          </div>

          {baselineStatus === 'loading' && isConnected && (
             <div className="mt-3 text-amber-600 text-xs font-semibold bg-amber-50 rounded-lg p-2 border border-amber-100">
               Baseline is establishing. Simulating purchases will not update roundups until ready.
             </div>
          )}
        </div>
        <div className="flex flex-col items-center justify-center gap-3">
          {isConnected && bankInfo && (
            <div className="text-right flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Transactions Bank Connected</span>
              <span className="text-sm font-bold text-slate-800">{bankInfo.bankName}</span>
              {bankInfo.mask && <span className="text-xs text-slate-500">•••• {bankInfo.mask}</span>}
            </div>
          )}
          <button
            onClick={() => open()}
            disabled={!ready || !linkToken || isLoadingTx}
            className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[220px]"
          >
            {(!ready || !linkToken || isLoadingTx) ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isConnected ? (
              <Plus className="w-5 h-5" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )}
            {isConnected ? 'Connect Another Bank' : 'Connect Bank'}
          </button>
        </div>
      </div>

      {!isEmbedded && (
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
            <button
              onClick={() => handleRefresh()}
              disabled={isLoadingTx || !isConnected}
              className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingTx ? 'animate-spin' : ''}`} />
              Refresh from Backend
            </button>
            {isSandbox && (
              <>
                <button
                  onClick={simulatePurchase}
                  disabled={isSimulating || isLoadingTx || !isConnected || baselineStatus !== 'ready'}
                  className="ml-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm disabled:cursor-not-allowed"
                >
                  {isSimulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  {(!isConnected) ? 'Connect a Sandbox bank first' : (baselineStatus !== 'ready' ? 'Waiting for baseline sync' : 'Simulate New $4.25 Purchase')}
                </button>
                <button
                  onClick={handleResetRoundups}
                  disabled={isResetting || isLoadingTx || !isConnected}
                  className="ml-2 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full hover:bg-rose-100 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm disabled:cursor-not-allowed"
                >
                  {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Reset Simulated Roundups
                </button>
              </>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {isConnected ? `Backend synced. Item ID: ${itemId || ''}` : 'No transactions'}
          </span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Merchant Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Purchase Amount</th>
                <th className="px-6 py-4 text-right">Roundup Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    {isLoadingTx ? (
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        <span>Fetching from backend...</span>
                      </div>
                    ) : (
                      'No recent purchases found. Connect a bank first.'
                    )}
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => {
                  const showBaselineLabel = tx.isBaseline && (index === 0 || !transactions[index - 1].isBaseline);
                  return (
                    <React.Fragment key={tx.id}>
                      {showBaselineLabel && (
                        <tr className="bg-slate-50">
                          <td colSpan={4} className="px-6 py-3 text-xs font-semibold text-slate-500 text-center uppercase tracking-widest border-y border-slate-100">
                             Historical sample purchases — not included in your roundup balance.
                          </td>
                        </tr>
                      )}
                      <tr className={`text-sm text-slate-600 ${index % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                        <td className="px-6 py-4 font-medium text-slate-900">{tx.merchant_name}</td>
                        <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-0.5 rounded">{tx.date}</span></td>
                        <td className="px-6 py-4 text-slate-500">${tx.amount.toFixed(2)}</td>
                        <td className={`px-6 py-4 text-right ${tx.roundup > 0 && !tx.isBaseline ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium'}`}>
                          {tx.roundup > 0 && !tx.isBaseline ? `+$${tx.roundup.toFixed(2)}` : '$0.00'}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {(tokenError || txError || !isConnected) && (
          <div className={`p-4 ${tokenError || txError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-slate-50 border-slate-100 text-slate-600'} border-t flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
            {tokenError || txError ? (
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <div className="text-xs font-medium space-y-1">
              <div>{tokenError || txError || 'For dynamic purchase testing, connect First Platypus Bank using:'}</div>
              {!(tokenError || txError) && (
                <>
                   <div className="font-mono text-slate-700">Username: user_transactions_dynamic</div>
                   <div className="font-mono text-slate-700">Password: test</div>
                   <div className="mt-2 text-slate-500 italic font-normal">For a basic Sandbox connection without simulated new purchases, use user_good / pass_good.</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      )}
    </>
  );
}
