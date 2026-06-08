import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { causes, palette } from '../data/causes';
import { 
  Bell, 
  ChevronDown, 
  Target, 
  Activity, 
  Gift,
  Star,
  Users,
  ChevronRight,
  ArrowUp,
  Moon,
  Quote,
  LayoutGrid,
  Droplets,
  ArrowRight,
  Menu
} from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchStatsAndDonations = async () => {
      try {
        const [statusResp, donationsResp, appDataResp] = await Promise.all([
          fetch('/api/stripe/status'),
          fetch('/api/stripe/donations'),
          fetch('/api/app_data')
        ]);
        
        if (statusResp.ok) {
          const statusData = await statusResp.json();
          setStats(statusData.stats);
        }
        if (donationsResp.ok) {
          const donationsData = await donationsResp.json();
          setDonations(donationsData.donations || []); // store all donations!
        }
        if (appDataResp.ok) {
          const appData = await appDataResp.json();
          setTransactions(appData.transactions || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };

    fetchStatsAndDonations();
    const interval = setInterval(fetchStatsAndDonations, 10000);
    return () => clearInterval(interval);
  }, []);

  const successfulDonations = donations.filter(d => d.status === 'succeeded');
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Monthly Giving: sum of successful donations this month
  const monthlyGivingCents = successfulDonations
    .filter(d => {
      const dDate = new Date(d.createdAt || 0);
      return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
    })
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  // Round-ups This Month: sum of transaction roundups this month (not baseline)
  const roundupsThisMonthCents = transactions
    .filter(tx => {
      if (tx.isBaseline) return false;
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    })
    .reduce((sum, tx) => sum + ((tx.roundup || 0) * 100), 0);
  
  // Total Donated
  const totalDonatedCents = stats ? (stats.successfulCents || 0) : 0;
  // Pending Balance
  const pendingCents = stats ? (stats.availableCents || 0) : 0;
  // ACH Processing
  const processingCents = stats ? (stats.processingCents || 0) : 0;
  
  const totalDonatedDollars = totalDonatedCents / 100;
  const pendingDollars = pendingCents / 100;
  const processingDollars = processingCents / 100;
  const monthlyGivingDollars = monthlyGivingCents / 100;
  const roundupsThisMonthDollars = roundupsThisMonthCents / 100;
  
  const isLoaded = stats !== null;
  const renderVal = (v: number) => isLoaded ? `$${v.toFixed(2)}` : <span className="animate-pulse text-transparent bg-gray-200 rounded px-2 w-16 inline-block leading-none">&nbsp;</span>;

  
  const totalCharityPool = totalDonatedDollars + pendingDollars;

  // Calculate dynamic goals and progress based on levels
  const causesWithDynamicGoals = causes.map((cause, idx) => {
    const weights = [3, 2.5, 2, 1.8, 1.5, 1.2, 1, 0.8, 0.5, 0.5];
    const weight = weights[idx % weights.length];
    const totalWeight = weights.slice(0, causes.length).reduce((a,b) => a+b, 0);
    
    // We base the raised amount on a slice of the total pool so it feels dynamic
    const raised = totalCharityPool * (weight / totalWeight);
    
    const getGoalLevel = (amt: number) => {
      const levels = [1, 5, 15, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
      for (const level of levels) {
        if (amt < level) return level;
      }
      return levels[levels.length - 1] * 2 || 1;
    };
    
    const goal = getGoalLevel(raised);
    const progress = Math.min(100, Math.round((raised / goal) * 100));

    return { ...cause, raised, goal, progress };
  });

  const recentDonation = donations.length > 0 ? donations[0] : null;

  const featuredGoal = causesWithDynamicGoals.find(c => c.featured) || causesWithDynamicGoals[0];
  const gridCauses = causesWithDynamicGoals.filter(c => !c.featured);

  return (
    <div className="font-sans antialiased bg-snow text-eel mt-4">
      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Goals Area */}
        <div className="flex-1 w-full lg:w-2/3">
          
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                Your Charity Goals
                <Moon className="text-bee-yellow fill-current w-6 h-6" />
              </h1>
              <p className="text-gray-500 mt-1">Every spare change. Every life changed.</p>
            </div>
          </div>
          
          {/* Featured Goal */}
          <div className="bg-humpback-blue rounded-xl text-white p-6 relative overflow-hidden mb-6 shadow-md bg-pattern-mosque">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
              
              {/* Icon Area */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="bg-blue-800/40 rounded-full px-3 py-1 text-xs font-semibold text-bee-yellow flex items-center gap-1 mb-4 border border-blue-700/50">
                  <Star className="w-3 h-3 fill-current" /> Featured Goal
                </div>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-humpback-blue shadow-inner">
                  <featuredGoal.icon className="w-10 h-10" />
                </div>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 w-full">
                <h2 className="text-2xl font-bold mb-1">{featuredGoal.title}</h2>
                <p className="text-blue-100 text-sm mb-6 max-w-md">{featuredGoal.subtitle}</p>
                
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-2xl font-bold">${featuredGoal.raised.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    <span className="text-blue-200 text-sm ml-1">raised of ${featuredGoal.goal.toLocaleString()} goal</span>
                  </div>
                  <span className="text-sm font-medium">{featuredGoal.progress}%</span>
                </div>
                <div className="progress-bar-bg mb-4">
                  <div className="progress-bar-fill" style={{ width: `${featuredGoal.progress}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-sm text-blue-200 gap-2">
                    <Users className="w-4 h-4" />
                    <span>{featuredGoal.contributors || Math.floor(Math.random()*100 + 10)} people contributed</span>
                  </div>
                  <Link to={`/goals/${featuredGoal.slug || featuredGoal.id}`} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                    View Goal <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Goals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {gridCauses.map((cause, idx) => {
              const colorClass = palette[idx % palette.length];
              return (
                <Link to={`/goals/${cause.slug || cause.id}`} key={cause.id} className={`bg-${colorClass} rounded-xl text-white p-5 shadow-sm relative overflow-hidden bg-pattern-stars transition-transform hover:-translate-y-1`} style={{ backgroundColor: `var(--color-${colorClass})` }}>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="text-3xl opacity-90">
                        <cause.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{cause.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-white/80 mb-4 flex-1">{cause.subtitle}</p>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                           ${cause.raised.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}{' '}
                           <span className="text-xs font-normal opacity-80">raised</span>
                        </span>
                        <span>{cause.progress}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${cause.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Footer Quote Area */}
          <div className="bg-feather-green/10 rounded-xl p-6 flex items-start gap-4 relative overflow-hidden mt-12">
            <div className="text-bee-yellow text-4xl mt-1 opacity-80 z-10 relative">
              <Moon className="w-8 h-8 fill-current" />
            </div>
            <div className="z-10 relative">
              <p className="text-gray-700 italic text-sm leading-relaxed mb-2">
                "The example of those who spend their wealth in the way of Allah is like a seed [of grain] that sprouts seven ears; in every ear is a hundred grains."
              </p>
              <p className="text-gray-500 text-xs font-medium">— Quran 2:261</p>
            </div>
            {/* Background Illustration Placeholder */}
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none text-feather-green">
              <svg fill="none" height="100" viewBox="0 0 200 100" width="200" xmlns="http://www.w3.org/2000/svg">
                <path d="M180 100C180 77.9086 162.091 60 140 60C117.909 60 100 77.9086 100 100H180Z" fill="currentColor"></path>
                <path d="M140 60V20C140 20 145 15 150 20C155 25 150 30 150 30" stroke="currentColor" strokeWidth="4"></path>
                <circle cx="150" cy="15" fill="currentColor" r="5" className="text-bee-yellow"></circle>
                <path d="M100 100C100 83.4315 86.5685 70 70 70C53.4315 70 40 83.4315 40 100H100Z" fill="currentColor"></path>
                <path d="M70 70V40" stroke="currentColor" strokeWidth="4"></path>
              </svg>
            </div>
          </div>
          
        </div>
        
        {/* Right Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-gray-900">Your Giving Summary</h3>
              <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-feather-green focus:ring-feather-green py-1 pl-2 pr-8 text-gray-600 bg-gray-50 outline-none">
                <option>This Month</option>
              </select>
            </div>
            
            <div className="space-y-6">
              {/* Stat 1 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-feather-green/10 text-feather-green flex items-center justify-center">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Monthly Giving</p>
                    <p className="text-xl font-bold text-gray-900">{renderVal(monthlyGivingDollars)}</p>
                  </div>
                </div>
              </div>
              
              <Link to="/roundups" className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-fox-orange/10 text-fox-orange flex items-center justify-center group-hover:bg-fox-orange group-hover:text-white transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Round-ups This Month</p>
                    <p className="text-xl font-bold text-gray-900">{renderVal(roundupsThisMonthDollars)}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              
              <div className="border-t border-gray-100 pt-6"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-feather-green/10 text-feather-green flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total Donated</p>
                    <p className="text-xl font-bold text-gray-900">{renderVal(totalDonatedDollars)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mt-5">All time</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Pending Roundup Balance</p>
                    <p className="text-lg font-bold text-gray-900">${pendingDollars.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {processingCents > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">ACH Withdrawals Processing</p>
                      <p className="text-lg font-bold text-gray-900">${processingDollars.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 border-t border-gray-100 pt-4 text-center">
              <Link to="/donations" className="text-sm text-feather-green font-medium hover:text-mask-green inline-flex items-center">
                View Donation History <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
          
          {/* Recent Donation Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Donation</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-feather-green/10 text-feather-green flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-tight">
                     ${recentDonation ? (recentDonation.amount / 100).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-xs text-gray-500">
                     {recentDonation 
                       ? `to ${recentDonation.metadata?.donation_type === 'roundup_withdrawal' ? "Round-ups" : "Chosen Cause"}`
                       : "No donations yet"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                     {recentDonation ? new Date(recentDonation.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            </div>
          </div>
          
          {/* Causes You Support */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-900">Causes You Support</h3>
              <a href="#" className="text-xs text-feather-green hover:underline">View all</a>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {causes.slice(0, 5).map((cause, i) => {
                const colorClass = palette[i % palette.length];
                return (
                  <div key={cause.id} className={`w-10 h-10 rounded-xl bg-${colorClass} text-white flex items-center justify-center shadow-sm`} style={{ backgroundColor: `var(--color-${colorClass})` }}>
                    <cause.icon className="w-5 h-5" />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">{causes.length} causes</p>
          </div>
          
          {/* Daily Inspiration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Daily Inspiration</h3>
            <div className="flex gap-3">
              <Quote className="text-gray-300 w-6 h-6 shrink-0 fill-current" />
              <div>
                <p className="text-sm text-gray-600 italic leading-relaxed mb-3">
                  "The example of those who spend their wealth in the way of Allah is like a seed [of grain] that grows seven spikes; in each spike is a hundred grains."
                </p>
                <p className="text-xs text-feather-green font-medium">— Al-Baqarah 2:261</p>
              </div>
            </div>
          </div>
          
          
        </div>
      </main>
    </div>
  );
}

