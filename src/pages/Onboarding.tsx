import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { usePlaidLink } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { BankTester } from '../components/BankTester';
import { StripeACHTester } from '../components/StripeACHTester';
import { PrimaryButton, SecondaryButton } from '../components/ui/Buttons';
import { SliderControl } from '../components/ui/SliderControl';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { causes } from '../data/causes';

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [multiplierVal, setMultiplierVal] = useState(0);
  const [wholeDollarVal, setWholeDollarVal] = useState(true);

  const toggleCause = (id: string) => {
    setSelectedCauses(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const nextStep = () => setStep(s => Math.min(7, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const content = () => {
    switch(step) {
      case 1:
        return (
          <div className="text-center space-y-8">
            <HeartPulse className="w-20 h-20 text-feather-green mx-auto mb-6" />
            <h2 className="text-[32px] font-black text-eel tracking-tight">Welcome to Sadaqa Box</h2>
            <p className="text-gray-500 font-medium text-[18px] leading-relaxed max-w-md mx-auto mb-10">
              We make it easy to automate your charity by rounding up your daily spare change and donating it to causes you love.
            </p>
            <PrimaryButton onClick={nextStep} variant="blue" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
              Continue <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </PrimaryButton>
          </div>
        );
      case 2:
        return (
          <div className="text-center space-y-8">
            <h2 className="text-[28px] font-extrabold text-eel tracking-tight">How roundups work</h2>
            <p className="text-gray-500 font-medium text-[17px] leading-relaxed max-w-md mx-auto mb-8">
              When you buy a coffee for $4.25, we automatically track the remaining $0.75. Once these small amounts reach $5, we withdraw it.
            </p>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 max-w-sm mx-auto shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-600 text-[16px]">Coffee Purchase</span>
                <span className="font-extrabold text-[22px] text-eel">$4.25</span>
              </div>
              <div className="flex justify-between items-center text-feather-green">
                <span className="font-bold text-[16px]">Spare Change Rounded</span>
                <span className="font-black text-[22px]">+ $0.75</span>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 mt-12">
              <SecondaryButton onClick={prevStep} className="w-full sm:w-auto">
                Back
              </SecondaryButton>
              <PrimaryButton onClick={nextStep} variant="blue" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </PrimaryButton>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 text-left">
            <div className="text-center">
              <h2 className="text-[28px] font-extrabold text-eel tracking-tight mb-4">Customize Round-Ups</h2>
              <p className="text-gray-500 font-medium text-[17px] leading-relaxed max-w-md mx-auto">
                Adjust how much spare change is collected. You can change this anytime.
              </p>
            </div>
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-eel mb-1">Round-Ups Multiplier</h3>
                <p className="text-[15px] text-gray-500 mb-2">Multiply your spare change to grow your impact.</p>
                <div className="mt-4">
                  <SliderControl 
                    steps={['1x', '2x', '3x', '10x']}
                    value={multiplierVal}
                    onChange={setMultiplierVal}
                    color="blue"
                  />
                </div>
              </div>
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-eel mb-1">Whole Dollar Round-Ups</h3>
                  <p className="text-[15px] text-gray-500 max-w-[280px]">Ex: If you buy lunch for $10, we will automatically invest $1</p>
                </div>
                <ToggleSwitch 
                  checked={wholeDollarVal}
                  onChange={setWholeDollarVal}
                  color="blue"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 mt-12 bg-white pt-4">
              <SecondaryButton onClick={prevStep} className="w-full sm:w-auto">
                Back
              </SecondaryButton>
              <PrimaryButton onClick={nextStep} variant="blue" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </PrimaryButton>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center space-y-8">
             <h2 className="text-[28px] font-extrabold text-eel tracking-tight">Choose your causes</h2>
             <p className="text-gray-500 font-medium text-[17px] leading-relaxed max-w-md mx-auto mb-8">
               You can update this at any time later in the dashboard.
             </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto relative z-10">
               {causes.map(cause => (
                 <button 
                   key={cause.id}
                   onClick={() => toggleCause(cause.id)}
                   className={`border-2 font-bold text-[17px] py-4 px-6 rounded-full cursor-pointer transition-all shadow-sm active:scale-95 text-center flex items-center justify-center ${
                     selectedCauses.includes(cause.id)
                      ? 'border-macaw-blue bg-[#eef8fc] text-[#178eb8] shadow-[0_2px_0_0_#1CB0F6]' 
                      : 'border-gray-200 bg-white text-gray-700 hover:border-macaw-blue hover:bg-[#eef8fc] hover:text-[#178eb8] shadow-[0_2px_0_0_#E5E7EB]'
                   }`}
                 >
                   {cause.title}
                 </button>
               ))}
             </div>
             <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 mt-12 bg-white pt-4">
              <SecondaryButton onClick={prevStep} className="w-full sm:w-auto">
                Back
              </SecondaryButton>
              <PrimaryButton onClick={nextStep} variant="blue" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </PrimaryButton>
            </div>
          </div>
        );
      case 5:
         return (
            <div className="space-y-8 text-left">
              <div className="text-center">
                <h2 className="text-[28px] font-extrabold text-eel tracking-tight mb-4">Connect spending account</h2>
                <p className="text-gray-500 font-medium text-[17px] leading-relaxed max-w-md mx-auto">
                   This is the account we'll securely monitor to calculate your spare change. We only have read access.
                </p>
              </div>
              <div className="max-w-xl mx-auto rounded-[2rem] border border-gray-100 shadow-sm p-2 bg-white">
                <BankTester isEmbedded />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 mt-12">
                <SecondaryButton onClick={prevStep} className="w-full sm:w-auto">
                  Back
                </SecondaryButton>
                <PrimaryButton onClick={nextStep} variant="blue" className="w-full sm:w-auto inline-flex items-center gap-2 justify-center">
                  Next Step <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </PrimaryButton>
              </div>
            </div>
         );
      case 6:
         return (
            <div className="space-y-8 text-left">
              <div className="text-center">
                <h2 className="text-[28px] font-extrabold text-eel tracking-tight mb-4">Connect funding account</h2>
                <p className="text-gray-500 font-medium text-[17px] leading-relaxed max-w-md mx-auto">
                   This is the account we'll use to securely withdraw your rounded-up donations via ACH.
                </p>
              </div>
              <div className="max-w-xl mx-auto rounded-[2rem] border border-gray-100 shadow-sm p-2 bg-white">
                 <StripeACHTester isEmbedded />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 mt-12">
                <SecondaryButton onClick={prevStep} className="w-full sm:w-auto">
                  Back
                </SecondaryButton>
                <PrimaryButton onClick={nextStep} variant="blue" className="w-full sm:w-auto inline-flex items-center gap-2 justify-center">
                  Next Step <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </PrimaryButton>
              </div>
            </div>
         );
      case 7:
         return (
           <div className="text-center space-y-8">
              <ShieldCheck className="w-20 h-20 text-feather-green mx-auto mb-6" />
              <h2 className="text-[32px] font-black text-eel tracking-tight">All set!</h2>
              <p className="text-gray-500 font-medium text-[18px] leading-relaxed max-w-md mx-auto mb-10">
                Your Sadaqa Box is active. Your spare change will now begin making a lasting impact.
              </p>
              <PrimaryButton onClick={() => navigate('/dashboard')} variant="blue" className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight className="w-5 h-5" strokeWidth={3} />
              </PrimaryButton>
           </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-snow flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white p-8 md:p-12 md:px-16 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
         <div className="flex justify-center gap-3 mb-12">
           {[1,2,3,4,5,6,7].map(i => (
             <div key={i} className={`h-3 rounded-full flex-1 transition-colors duration-500 ${i <= step ? 'bg-macaw-blue' : 'bg-gray-100'}`} />
           ))}
         </div>
         {content()}
      </div>
    </div>
  );
}
