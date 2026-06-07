import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, History, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Donations() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const donationsResp = await fetch('/api/stripe/donations');
        if (donationsResp.ok) {
          const donationsData = await donationsResp.json();
          setDonations(donationsData.donations || []);
        }
      } catch (err) {
        console.error('Failed to fetch donations data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-feather-green"></div>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-eel p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <History className="w-8 h-8 text-feather-green" />
          Donation History
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
           <div className="relative flex-1 max-w-xs">
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input type="text" placeholder="Search causes..." className="w-full text-sm border-gray-200 rounded-xl pl-9 pr-4 py-2 focus:ring-feather-green focus:border-feather-green" />
           </div>
           <select className="text-sm border-gray-200 rounded-xl bg-white shadow-sm focus:ring-feather-green focus:border-feather-green py-2 pl-3 pr-8 text-gray-600">
             <option>All Types</option>
             <option>Round-ups</option>
             <option>One-time</option>
           </select>
        </div>

        {donations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Clock className="w-8 h-8" />
             </div>
             <p className="text-gray-500 font-medium text-lg">No donations found</p>
             <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Once your roundups reach the minimum threshold, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Cause / Type</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">
                        {d.metadata?.donation_type === 'roundup_withdrawal' ? "Round-ups" : "Direct Donation"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Automated Withdrawal</p>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ${(d.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        d.status === 'succeeded' 
                          ? 'bg-green-100 text-green-800'
                          : d.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {d.status === 'succeeded' ? 'Completed' : d.status === 'processing' ? 'Processing' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 font-medium">
                      ACH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
