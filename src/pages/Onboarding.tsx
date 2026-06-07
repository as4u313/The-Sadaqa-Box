import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { usePlaidLink } from 'react-plaid-link';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { BankTester } from '../components/BankTester'; // existing working part
import { StripeACHTester } from '../components/StripeACHTester';

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(s => Math.min(6, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const content = () => {
    switch(step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <HeartPulse className="w-16 h-16 text-feather-green mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold">Welcome to Sadaqa Box</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
              We make it easy to automate your charity by rounding up your daily spare change and donating it to causes you love.
            </p>
            <button onClick={nextStep} className="bg-feather-green hover:bg-mask-green text-white px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2">
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-extrabold">How roundups work</h2>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
              When you buy a coffee for $4.25, we automatically track the remaining $0.75. Once these small amounts reach $5, we withdraw it as your Sadaqa.
            </p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-sm mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700">Coffee Purchase</span>
                <span className="font-extrabold text-xl text-eel">$4.25</span>
              </div>
              <div className="flex justify-between items-center text-feather-green">
                <span className="font-bold">Spare Change Rounded</span>
                <span className="font-extrabold text-xl">+ $0.75</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={prevStep} className="px-8 py-3 rounded-full font-bold text-gray-500 hover:text-gray-800 transition-colors">
                Back
              </button>
              <button onClick={nextStep} className="bg-feather-green hover:bg-mask-green text-white px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-6">
             <h2 className="text-2xl font-extrabold">Choose your causes</h2>
             <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
               You can update this at any time later in the dashboard.
             </p>
             <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
               {['Water Well Fund', 'Feed a Family', 'Orphans Support', 'Masjid Support'].map(cause => (
                 <div key={cause} className="border-2 border-feather-green bg-feather-green/10 text-feather-green font-bold p-3 rounded-xl cursor-pointer">
                   {cause}
                 </div>
               ))}
               <div className="col-span-2 text-sm text-gray-400 mt-2">More causes available in the dashboard.</div>
             </div>
             <div className="flex justify-center gap-4 mt-8">
              <button onClick={prevStep} className="px-8 py-3 rounded-full font-bold text-gray-500 hover:text-gray-800 transition-colors">
                Back
              </button>
              <button onClick={nextStep} className="bg-feather-green hover:bg-mask-green text-white px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      case 4:
         // Connect Bank (Plaid)
         return (
            <div className="text-center space-y-6 text-left">
              <h2 className="text-2xl font-extrabold mb-4">Connect your spending account</h2>
              <p className="text-gray-500 font-medium leading-relaxed max-w-md text-left mx-auto">
                 This is the account we'll securely monitor to calculate your spare change. We only have read access.
              </p>
              <div className="max-w-md mx-auto text-left">
                <BankTester isEmbedded />
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={prevStep} className="px-8 py-3 rounded-full font-bold text-gray-500 hover:text-gray-800 transition-colors">
                  Back
                </button>
                <button onClick={nextStep} className="bg-macaw-blue hover:bg-humpback-blue text-white px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2">
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
         );
      case 5:
         // Connect ACH (Stripe)
         return (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-extrabold mb-4">Connect your funding account</h2>
              <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto text-left">
                 This is the account we'll use to securely withdraw your rounded-up donations once they reach $5.
              </p>
              <div className="max-w-md mx-auto text-left">
                 <StripeACHTester isEmbedded />
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={prevStep} className="px-8 py-3 rounded-full font-bold text-gray-500 hover:text-gray-800 transition-colors">
                  Back
                </button>
                <button onClick={nextStep} className="bg-macaw-blue hover:bg-humpback-blue text-white px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2">
                  Next Step <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
         );
      case 6:
         return (
           <div className="text-center space-y-6">
              <ShieldCheck className="w-16 h-16 text-feather-green mx-auto mb-4" />
              <h2 className="text-3xl font-extrabold">All set!</h2>
              <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-md mx-auto">
                Your Sadaqa Box is active.
              </p>
              <button onClick={() => navigate('/dashboard')} className="bg-feather-green hover:bg-mask-green text-white px-8 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </button>
           </div>
         );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-snow flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
         <div className="flex justify-center gap-2 mb-10">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className={`h-2 rounded-full flex-1 ${i <= step ? 'bg-feather-green' : 'bg-gray-100'}`} />
           ))}
         </div>
         {content()}
      </div>
    </div>
  );
}
