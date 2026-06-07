import React from 'react';
import { BankTester } from '../components/BankTester';
import { StripeACHTester } from '../components/StripeACHTester';
import { RoundupWithdrawalTester } from '../components/RoundupWithdrawalTester';
import { Box } from 'lucide-react';

export function TesterView() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col p-8 pb-32">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        <nav className="flex justify-between items-center mb-10 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Box className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Sadaqa Box <span className="text-slate-400 font-normal ml-1 text-sm uppercase tracking-widest">Tester</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold uppercase tracking-wider hidden sm:block">
              Dev Sandbox Mode
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 font-medium">Server Status: Online</span>
            </div>
          </div>
        </nav>
        
        <main className="flex-1 flex flex-col gap-6">
          <BankTester />
          <StripeACHTester />
          <RoundupWithdrawalTester />
        </main>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-tighter mt-8">
          <div className="flex gap-6">
            <span>ENV: SANDBOX_ACTIVE</span>
            <span>TOKEN_STATUS: READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
