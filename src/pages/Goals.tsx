import React from 'react';
import { Link } from 'react-router-dom';
import { causes, palette } from '../data/causes';

export function Goals() {
  return (
    <div className="font-sans antialiased text-eel p-8 max-w-[1400px] mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">All Causes</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Explore all the amazing causes you can support with your spare change. Every cent makes a difference.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {causes.map((cause, idx) => {
          const colorClass = palette[idx % palette.length];
          return (
            <Link 
              to={`/goals/${cause.slug || cause.id}`} 
              key={cause.id} 
              className={`bg-${colorClass} rounded-2xl text-white p-6 shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md block bg-pattern-stars`} 
              style={{ backgroundColor: `var(--color-${colorClass})` }}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl opacity-90 border-2 border-white/20 p-3 rounded-2xl bg-white/10">
                    <cause.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="font-bold text-xl leading-tight mb-2">{cause.title}</h3>
                <p className="text-sm text-white/80 mb-6 flex-1 line-clamp-2 leading-relaxed">{cause.subtitle}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-xl font-bold">${cause.raised.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Target: ${cause.goal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
