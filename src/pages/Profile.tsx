import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, CreditCard, Heart, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import { causes } from '../data/causes';
import { SettingsSection } from '../components/ui/SettingsSection';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { SecondaryButton } from '../components/ui/Buttons';

export function Profile() {
  const [roundupsOn, setRoundupsOn] = useState(true);

  return (
    <div className="font-sans antialiased text-eel p-4 sm:p-8 max-w-5xl mx-auto min-h-screen bg-snow">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/dashboard" className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-[32px] font-extrabold tracking-tight">Profile & Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm text-center sticky top-24">
            <div className="w-28 h-28 bg-feather-green text-white rounded-[1.5rem] mx-auto flex items-center justify-center text-[40px] font-black mb-6 shadow-sm">
              AA
            </div>
            <h2 className="text-[22px] font-black text-gray-900 mb-1">As-Salaam</h2>
            <p className="text-[16px] text-gray-500 font-medium mb-8">user@sadaqabox.com</p>
            <button className="w-full text-red-500 font-bold border-2 border-red-100 hover:bg-red-50 py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-[17px] active:scale-95 shadow-sm">
               <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-10">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                 <Heart className="w-6 h-6 text-cardinal-red" />
               </div>
               <h3 className="text-[26px] font-extrabold tracking-tight">Giving Preferences</h3>
             </div>

             <div className="mt-8">
               <SettingsSection title="Spare Change Roundups">
                 <div className="flex justify-between items-center">
                   <p className="text-[16px] text-gray-500 font-medium max-w-xs leading-relaxed">
                     Automatically round up your daily purchases and donate the spare change.
                   </p>
                   <ToggleSwitch checked={roundupsOn} onChange={setRoundupsOn} />
                 </div>
               </SettingsSection>

               <SettingsSection title="Active Causes">
                 <div className="flex justify-between items-center">
                   <p className="text-[16px] text-gray-700 font-bold truncate max-w-[200px]">
                     {causes.slice(0,3).map(c=>c.title).join(', ')}
                   </p>
                   <SecondaryButton>Manage</SecondaryButton>
                 </div>
               </SettingsSection>

               <SettingsSection title="Withdrawal Threshold">
                 <div className="flex justify-between items-center">
                   <p className="text-[16px] text-gray-500 font-medium max-w-xs leading-relaxed">
                     Your spare change is securely withdrawn and donated once it reaches <strong className="text-gray-900">$5.00</strong>.
                   </p>
                   <SecondaryButton>Edit</SecondaryButton>
                 </div>
               </SettingsSection>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                 <CreditCard className="w-6 h-6 text-macaw-blue" />
               </div>
               <h3 className="text-[26px] font-extrabold tracking-tight">Connected Accounts</h3>
             </div>

             <div className="space-y-6">
               <div className="flex items-center gap-5 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                 <div className="w-12 h-12 bg-white shadow-sm rounded-[1rem] flex items-center justify-center">
                   <CheckCircle2 className="w-6 h-6 text-gray-400" />
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-[18px] text-gray-900 mb-1">Checking •••• 1234</p>
                   <p className="text-[14px] text-gray-500 font-medium">Connected for roundups (Read-only)</p>
                 </div>
                 <span className="text-[13px] font-bold text-green-700 bg-green-100 border border-green-200 px-4 py-1.5 rounded-full uppercase tracking-wider">Connected</span>
               </div>
               
               <div className="flex items-center gap-5 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                 <div className="w-12 h-12 bg-white shadow-sm rounded-[1rem] flex items-center justify-center">
                   <CheckCircle2 className="w-6 h-6 text-gray-400" />
                 </div>
                 <div className="flex-1">
                   <p className="font-bold text-[18px] text-gray-900 mb-1">ACH Funding Account</p>
                   <p className="text-[14px] text-gray-500 font-medium">Funding source for your donations</p>
                 </div>
                 <span className="text-[13px] font-bold text-green-700 bg-green-100 border border-green-200 px-4 py-1.5 rounded-full uppercase tracking-wider">Active</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
