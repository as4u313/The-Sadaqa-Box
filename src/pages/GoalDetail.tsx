import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, ChevronRight, Activity, Flame, ShieldCheck } from 'lucide-react';
import { causes, palette } from '../data/causes';

export function GoalDetail() {
  const { slug } = useParams();
  
  const causeIndex = causes.findIndex(c => c.slug === slug || c.id === slug);
  const cause = causes[causeIndex];
  
  if (!cause) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-snow">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Goal not found</h2>
          <Link to="/goals" className="text-feather-green font-bold hover:underline">Return to goals</Link>
        </div>
      </div>
    );
  }

  const {
    title, subtitle, fullDescription, category, raised, goal, contributors, 
    impactMetrics, updates, relatedGoals, icon: Icon
  } = cause;

  const progress = Math.min(100, Math.round((raised / goal) * 100));
  const colorClass = palette[causeIndex % palette.length];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="font-sans antialiased text-eel min-h-screen bg-snow flex flex-col pb-20">
      {/* Hero Section */}
      <div className={`bg-${colorClass} text-white pt-8 pb-32 px-4 shadow-sm relative overflow-hidden bg-pattern-stars`} style={{ backgroundColor: `var(--color-${colorClass})` }}>
         <div className="max-w-[1000px] mx-auto relative z-10">
           <Link to="/goals" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold mb-8 transition-colors">
             <ArrowLeft className="w-5 h-5" /> Back to Causes
           </Link>
           <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
             <div className="w-32 h-32 md:w-48 md:h-48 bg-white text-gray-900 rounded-[2rem] flex items-center justify-center shadow-lg border-4 border-white/20 shrink-0">
               <Icon className="w-16 h-16 md:w-24 md:h-24 opacity-80" />
             </div>
             <div className="flex-1">
               <div className="inline-block bg-white/20 px-3 py-1 rounded-lg text-sm font-bold tracking-wider uppercase mb-4 shadow-sm border border-white/10">
                 {category}
               </div>
               <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight drop-shadow-sm">{title}</h1>
               <p className="text-xl opacity-90 font-medium max-w-2xl leading-relaxed drop-shadow-sm">{subtitle}</p>
             </div>
           </div>
         </div>
         {/* Wave SVG */}
         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none translate-y-1">
           <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
             <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,115.63,189.5,103.5,236.4,93.85,280.9,78.21,321.39,56.44Z" fill="#F8F9FA"></path>
           </svg>
         </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 w-full -mt-16 md:-mt-24 relative z-20 flex flex-col md:flex-row gap-8">
        
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100">
             <h2 className="text-2xl font-extrabold mb-6">About this cause</h2>
             <p className="text-gray-600 font-medium leading-relaxed text-lg mb-8">{fullDescription}</p>
             
             {impactMetrics && impactMetrics.length > 0 && (
               <>
                 <div className="border-t border-gray-100 my-8"></div>
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <Flame className="w-5 h-5 text-fox-orange" /> Real Impact
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                   {impactMetrics.map((metric: any, i: number) => (
                     <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                       <p className="text-3xl font-black text-gray-900 mb-1">{metric.value}</p>
                       <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{metric.label}</p>
                     </div>
                   ))}
                 </div>
               </>
             )}

             {updates && updates.length > 0 && (
               <>
                 <div className="border-t border-gray-100 my-8"></div>
                 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-macaw-blue" /> Recent Updates
                 </h3>
                 <div className="space-y-4">
                   {updates.map((update: any, i: number) => (
                     <div key={i} className="flex gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                       <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center shrink-0 border border-blue-100">
                         <span className="text-[10px] font-bold text-blue-400 uppercase leading-none mb-1">{update.date.split(' ')[0]}</span>
                         <span className="text-lg font-black text-humpback-blue leading-none">{update.date.split(' ')[1]}</span>
                       </div>
                       <div>
                         <p className="text-gray-800 font-medium">{update.message}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-[340px] flex flex-col gap-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 sticky top-24">
             <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-black">${raised.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-400 mb-3">
                  <span>raised of ${goal.toLocaleString()}</span>
                  <span className={`text-${colorClass}`}>{progress}%</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-${colorClass} transition-all duration-1000 ease-out`} style={{ width: `${progress}%`, backgroundColor: `var(--color-${colorClass})` }}></div>
                </div>
             </div>

             <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-8 bg-gray-50 p-3 rounded-xl">
               <Users className="w-4 h-4 text-gray-400" />
               {contributors} people contributed
             </div>

             <div className="space-y-3">
               <button className={`w-full bg-${colorClass} hover:opacity-90 text-white font-extrabold py-4 px-6 rounded-2xl transition-all shadow-sm active:scale-95 text-lg`} style={{ backgroundColor: `var(--color-${colorClass})` }}>
                 Donate Now
               </button>
               <button className="w-full bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95">
                 Set as Primary Cause
               </button>
               <button className="w-full text-gray-400 hover:text-gray-600 font-bold py-2 text-sm">
                 Share this cause
               </button>
             </div>
             
             <div className="mt-6 flex justify-center text-gray-300">
               <ShieldCheck className="w-6 h-6" />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
