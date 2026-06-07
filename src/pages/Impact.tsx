import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, HeartHandshake, Home, HandHeart, Info } from 'lucide-react';

export function Impact() {
  return (
    <div className="font-sans antialiased text-eel p-4 sm:p-8 max-w-[1400px] mx-auto min-h-screen bg-snow">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-beetle-purple" />
          Your Impact
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center mt-20">
        <div className="w-24 h-24 bg-purple-50 text-beetle-purple rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-purple-100">
           <HeartHandshake className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Impact updates coming soon</h2>
        <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed max-w-md">
          We are currently gathering real impact data from the field. Check back soon to see exactly how your spare change is making a difference across the globe.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 flex gap-3 text-left border border-gray-100 max-w-sm">
           <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
           <p className="text-sm text-gray-500 font-medium">100% of your completed donations have been allocated to your selected causes.</p>
        </div>
      </div>
    </div>
  );
}
