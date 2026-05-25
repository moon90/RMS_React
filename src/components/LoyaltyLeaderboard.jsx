import React from 'react';
import { FaUserCircle, FaAward, FaGem, FaMedal, FaExternalLinkAlt, FaHistory } from 'react-icons/fa';
import { formatCurrency } from '../utils/currencyUtils';

const LoyaltyLeaderboard = ({ data, isLoading, currencyCode, currencySymbol }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse">
        <div className="h-8 w-48 bg-gray-100 rounded-lg mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const getTierStyle = (tier) => {
    switch (tier) {
      case 'Gold': return 'bg-amber-500 text-white shadow-lg shadow-amber-500/20';
      case 'Silver': return 'bg-slate-400 text-white shadow-lg shadow-slate-400/20';
      default: return 'bg-orange-700 text-white shadow-lg shadow-orange-700/20';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Gold': return <FaGem className="text-white" />;
      case 'Silver': return <FaMedal className="text-white" />;
      default: return <FaAward className="text-white" />;
    }
  };

  // Filter out meaningless zero-value entries in the frontend as a safety layer
  const filteredData = data?.filter(customer => customer.lifetimeValue > 0) || [];

  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 md:mb-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2.5 md:p-3 bg-orange-500 rounded-2xl shadow-xl shadow-orange-100">
            <FaAward className="text-white text-lg md:text-xl" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-800">VIP Loyalty Network</h2>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Top Active Revenue Drivers</p>
          </div>
        </div>
        <button className="p-2 bg-slate-50 rounded-xl text-slate-300 hover:text-indigo-600 transition-colors">
           <FaExternalLinkAlt size={10} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {(filteredData.length === 0) ? (
          <div className="py-12 text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
               <FaUserCircle size={32} className="text-slate-200" />
            </div>
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">No Active VIPs</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed uppercase tracking-wider">
               Customer loyalty data will appear here once sales are linked to registered customers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
          {filteredData.map((customer, idx) => (
            <div key={idx} className="group flex items-center justify-between p-3 md:p-5 rounded-2xl md:rounded-[2rem] hover:bg-gray-50 transition-all duration-500 border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm md:text-xl shadow-inner group-hover:bg-white transition-all">
                    {customer?.customerName?.charAt(0) || 'C'}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-1 md:p-1.5 rounded-lg md:rounded-xl border-2 md:border-4 border-white ${getTierStyle(customer.tier)}`}>
                    <div className="text-[8px] md:text-[10px]">
                        {getTierIcon(customer.tier)}
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-xs md:text-sm text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                    {customer?.customerName || 'Guest Customer'}
                  </h4>
                  <div className="flex items-center gap-1.5 md:gap-3 mt-0.5 md:mt-1">
                    <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{customer.points} Pts</span>
                    <span className="hidden xs:block w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span className="hidden lg:flex text-[8px] md:text-[9px] font-bold text-slate-400 items-center gap-1 uppercase tracking-widest">
                        <FaHistory size={8} /> {customer.lastVisit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                <p className="font-black text-sm md:text-base text-slate-900 tracking-tighter">
                    {formatCurrency(customer.lifetimeValue, currencyCode, currencySymbol)}
                </p>
                <p className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">LTV</p>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-50">
         <div className="flex items-center justify-between px-2">
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Strategy</p>
            <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
         </div>
      </div>
    </div>
  );
};

export default LoyaltyLeaderboard;
