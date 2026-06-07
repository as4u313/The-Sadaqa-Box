import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronRight, CheckCircle2, Shield, Leaf, Droplets } from 'lucide-react';
import { causes } from '../data/causes';

export function LandingPage() {
  return (
    <div className="font-sans antialiased min-h-screen bg-snow text-eel flex flex-col">
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-feather-green text-white flex items-center justify-center rounded">
              {/* Moon / Star icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2v2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8h2c0 5.523-4.477 10-10 10z"/>
              </svg>
            </div>
            <span className="text-xl font-bold">Sadaqa Box</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/onboarding" className="text-gray-600 font-bold hover:text-gray-900">Sign In</Link>
            <Link to="/onboarding" className="bg-feather-green hover:bg-mask-green text-white px-5 py-2.5 rounded-full font-bold transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-4 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-eel leading-tight mb-6 tracking-tight">
            Small change. <br className="hidden md:block"/> <span className="text-feather-green">Lasting impact.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            Sadaqa Box connects to your daily purchases, rounding up the spare change to automate your charity seamlessly. Give effortlessly while you live your life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/onboarding" className="w-full sm:w-auto bg-macaw-blue hover:bg-humpback-blue text-white px-8 py-4 rounded-2xl font-extrabold text-lg transition-transform hover:-translate-y-1 shadow-sm flex items-center justify-center gap-2">
              Start Giving Today <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </Link>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="bg-gray-100 rounded-xl p-4 flex items-center gap-4 border border-gray-200">
               <div className="text-left">
                  <p className="text-sm font-bold text-gray-500">Coffee Purchase</p>
                  <p className="text-xl font-extrabold">$4.25</p>
               </div>
               <div className="w-8 flex justify-center text-gray-400">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
               </div>
               <div className="text-left bg-feather-green/10 p-2 rounded-lg">
                  <p className="text-sm font-bold text-feather-green">Sadaqa</p>
                  <p className="text-xl font-extrabold text-[#5c9910]">+ $0.75</p>
               </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-gray-50 border-t border-gray-100 py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-macaw-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Link your card</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Securely connect your daily spending card. We use bank-level security to view transactions only.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-green-50 text-feather-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Live your life</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Every time you buy a coffee or groceries, we round up the spare change from your purchase.</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-purple-50 text-beetle-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-black">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Make an impact</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Once you reach $5, we withdraw it and distribute it to the causes you care about automatically.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Transparency */}
        <section className="py-20 px-4 max-w-5xl mx-auto text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="text-3xl font-extrabold mb-6">Trust and Transparency</h2>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            We use industry-standard encryption for all connections. Your money is safe, and 100% of your Sadaqa goes toward your chosen causes (minus standard payment processing fees).
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-gray-600">
            <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl"><CheckCircle2 className="w-4 h-4 text-feather-green" /> Plaid Secure Connection</span>
            <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl"><CheckCircle2 className="w-4 h-4 text-feather-green" /> Stripe Payment Processing</span>
            <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl"><CheckCircle2 className="w-4 h-4 text-feather-green" /> Read-only Bank Access</span>
          </div>
        </section>
      </main>

      <footer className="bg-eel text-white py-12 text-center">
        <p className="font-bold opacity-80">&copy; {new Date().getFullYear()} Sadaqa Box. All rights reserved.</p>
      </footer>
    </div>
  );
}
