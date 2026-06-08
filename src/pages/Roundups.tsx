import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Target, Banknote, List, ChevronDown, ChevronRight, Settings2 } from 'lucide-react';
import { BankTester } from '../components/BankTester';
import { RoundupWithdrawalTester } from '../components/RoundupWithdrawalTester';
import { SettingsSection } from '../components/ui/SettingsSection';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { PillOptionGroup } from '../components/ui/PillOptionGroup';
import { SliderControl } from '../components/ui/SliderControl';
import { PrimaryButton } from '../components/ui/Buttons';

export function Roundups() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSandbox, setShowSandbox] = useState(false);

  // Settings State
  const [autoDonate, setAutoDonate] = useState(true);
  const [multiplierEnabled, setMultiplierEnabled] = useState(true);
  const [multiplier, setMultiplier] = useState('2');
  const [wholeDollar, setWholeDollar] = useState(true);

  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [isSimulatingCoffee, setIsSimulatingCoffee] = useState(false);
  const [coffeeStatus, setCoffeeStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusResp, appDataResp] = await Promise.all([
          fetch('/api/stripe/status'),
          fetch('/api/app_data')
        ]);
        
        if (statusResp.ok) {
          const statusData = await statusResp.json();
          setStats(statusData.stats);
        }
        if (appDataResp.ok) {
          const appData = await appDataResp.json();
          setTransactions(appData.transactions || []);
          setIsSandboxMode(appData.isSandbox || false);
        }
      } catch (err) {
        console.error('Failed to fetch roundups data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const simulateCoffeePurchase = async () => {
    setIsSimulatingCoffee(true);
    setCoffeeStatus('Test coffee purchase created. Waiting for Plaid sync...');
    try {
      const resp = await fetch('/api/simulate_purchase', { method: 'POST' });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to simulate purchase');
      }
      setTimeout(() => {
        setCoffeeStatus('Sadaqa Box Test Coffee synced successfully: +$0.75 roundup');
      }, 1500);
    } catch (err: any) {
      setCoffeeStatus(`Error: ${err.message}`);
    } finally {
      setIsSimulatingCoffee(false);
    }
  };

  const pendingCents = stats ? (stats.availableCents || 0) : 0;
  const processingCents = stats ? (stats.processingCents || 0) : 0;
  
  const pendingDollars = pendingCents / 100;
  const processingDollars = processingCents / 100;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const roundupsThisMonthCents = transactions
    .filter(tx => {
      if (tx.isBaseline) return false;
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    })
    .reduce((sum, tx) => sum + ((tx.roundup || 0) * 100), 0);
  const roundupsThisMonthDollars = roundupsThisMonthCents / 100;

  const threshold = 5.00;
  const progress = Math.min(100, Math.round((pendingDollars / threshold) * 100));

  const isLoaded = stats !== null;
  const renderVal = (v: number) => isLoaded ? `$${v.toFixed(2)}` : <span className="animate-pulse text-transparent bg-gray-200 rounded px-2 w-16 inline-block leading-none">&nbsp;</span>;

  return (
    <div className="font-sans antialiased text-eel p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-fox-orange" />
            Your Round-ups
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-12 flex flex-col md:flex-row gap-8 items-center bg-pattern-mosque relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-fox-orange/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
         <div className="flex-1 w-full relative z-10">
           <h2 className="text-[15px] font-bold text-gray-500 uppercase tracking-wider mb-2">Available Pending Balance</h2>
           <div className="text-5xl font-black text-gray-900 mb-6">{renderVal(pendingDollars)}</div>
           
           <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
             <div className="flex justify-between items-center mb-3">
               <span className="text-[17px] font-bold text-gray-700">Progress to next withdrawal</span>
               <span className="text-[17px] font-bold text-gray-900">{progress}%</span>
             </div>
             <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-fox-orange rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
             </div>
             <p className="text-[15px] text-gray-500 font-medium leading-relaxed mt-2">
               Automatically donate the entire balance after it reaches $5.
             </p>
           </div>
         </div>

         <div className="w-full md:w-72 flex flex-col gap-4 relative z-10">
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex items-center gap-5">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-fox-orange shadow-sm border border-orange-50">
                 <Target className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-[14px] font-bold text-gray-500">Processing via ACH</p>
                 <p className="text-xl font-bold text-gray-900">{renderVal(processingDollars)}</p>
               </div>
            </div>
            <div className="bg-green-50 p-5 rounded-2xl border border-green-100 flex items-center gap-5">
               <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-feather-green shadow-sm border border-green-50">
                 <Banknote className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-[14px] font-bold text-gray-500">Generated This Month</p>
                 <p className="text-xl font-bold text-gray-900">{renderVal(roundupsThisMonthDollars)}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm mb-12">
        <div className="flex items-center gap-3 mb-8">
           <Settings2 className="w-8 h-8 text-eel" />
           <h2 className="text-[28px] font-extrabold text-eel tracking-tight">Round-Ups Settings</h2>
        </div>

        <SettingsSection 
          titleToggle={<ToggleSwitch checked={multiplierEnabled} onChange={setMultiplierEnabled} />}
          title="Multiplier"
          description="Grow your impact a little faster by multiplying your Round-Ups."
        >
          {multiplierEnabled && (
            <div className="mt-4">
              <PillOptionGroup 
                options={[{label: '2x', value: '2'}, {label: '3x', value: '3'}, {label: '10x', value: '10'}]}
                selected={multiplier}
                onChange={setMultiplier}
              />
            </div>
          )}
        </SettingsSection>
        
        <SettingsSection 
          titleToggle={<ToggleSwitch checked={wholeDollar} onChange={setWholeDollar} />}
          title="Whole Dollar Round-Ups"
          description="Control if whole dollar transactions should be rounded up by $1.00."
        >
        </SettingsSection>

        <SettingsSection 
          title="Linked Accounts"
          description="We round-up your spare change. With more Linked Accounts, you can increase your Round-Ups potential!"
        >
           <PrimaryButton>Manage</PrimaryButton>
        </SettingsSection>
      </div>

      {/* Sandbox Controls */}
      {isSandboxMode && (
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-sm border border-orange-200 p-8 bg-orange-50/30">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sandbox Testing</h3>
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-6">
              Simulate a purchase to see how your round-ups work.
            </p>
            <button 
              onClick={simulateCoffeePurchase}
              disabled={isSimulatingCoffee}
              className="bg-humpback-blue hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-[16px]"
            >
              {isSimulatingCoffee ? 'Simulating...' : 'Simulate $4.25 Coffee'}
            </button>
            {coffeeStatus && (
              <p className={`text-[14px] font-bold mt-4 ${coffeeStatus.includes('Error') ? 'text-red-500' : 'text-feather-green'}`}>
                {coffeeStatus}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-12">
        <h3 className="text-[22px] font-bold mb-6 flex items-center gap-3 text-eel">
           <List className="w-6 h-6 text-gray-400" />
           Recent Purchases
        </h3>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-16 text-center text-[17px] text-gray-500 font-medium">No purchases tracked yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-[13px] uppercase text-gray-500 font-bold tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Merchant</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5 text-right">Purchase</th>
                    <th className="px-8 py-5 text-right text-feather-green">Roundup</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.slice(0, 50).map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5 font-bold text-[16px] text-gray-900">{tx.name}</td>
                      <td className="px-8 py-5 text-[15px] text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-[16px] text-right font-medium text-gray-700">${tx.amount.toFixed(2)}</td>
                      <td className="px-8 py-5 text-[17px] text-right font-bold text-feather-green">
                        {tx.isBaseline ? '—' : `+ $${tx.roundup.toFixed(2)}`}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${
                          tx.isBaseline 
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {tx.isBaseline ? 'Historical' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
