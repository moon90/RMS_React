import React from 'react';
import { FaUtensils, FaClock, FaFire, FaChartPie, FaBolt, FaHistory } from 'react-icons/fa';

const KitchenIntelligence = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse border border-gray-50">
        <div className="h-8 w-48 bg-gray-100 rounded-lg mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const getEfficiencyStyle = (tag) => {
    switch (tag) {
      case 'Elite Speed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Steady': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 md:mb-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2.5 md:p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-100">
            <FaUtensils className="text-white text-lg md:text-xl" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-800">Kitchen AI</h2>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Preparation Productivity</p>
          </div>
        </div>
        <div className="p-2 bg-orange-50 rounded-xl">
           <FaFire className="text-orange-300" size={14} />
        </div>
      </div>

      <div className="flex-1 space-y-3 md:space-y-4">
        {(!data || data.length === 0) ? (
          <div className="py-10 text-center flex flex-col items-center gap-4">
            <FaHistory size={30} className="text-slate-100 md:w-10 md:h-10" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Syncing kitchen metrics...</p>
          </div>
        ) : (
          data.map((chef, idx) => (
            <div key={idx} className="group flex items-center justify-between p-3 md:p-4 rounded-2xl md:rounded-3xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-orange-50 flex items-center justify-center font-black text-orange-600 text-base md:text-lg shadow-inner group-hover:bg-white transition-colors">
                    {chef?.chefName?.charAt(0) || 'C'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-lg shadow-sm">
                    <FaBolt className="text-amber-500 text-[6px] md:text-[8px]" />
                  </div>
                </div>
                <div className="max-w-[80px] md:max-w-none">
                  <h4 className="font-black text-xs md:text-sm text-slate-800 tracking-tight truncate">{chef?.chefName || 'Chef Member'}</h4>
                  <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-wider truncate">{chef.ordersCompleted} orders</span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="hidden sm:flex text-[8px] md:text-[9px] font-bold text-slate-400 items-center gap-1 uppercase tracking-wider truncate">
                        Avg: {chef.averagePrepTimeMinutes.toFixed(1)}m
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-1.5 py-0.5 rounded-lg text-[7px] md:text-[8px] font-black uppercase border ${getEfficiencyStyle(chef.efficiencyTag)}`}>
                    {chef.efficiencyTag}
                </span>
                <p className="text-[7px] md:text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 md:mt-1.5">Efficiency</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-50 flex items-center justify-between px-2">
         <div className="flex items-center gap-2">
            <FaChartPie className="text-indigo-600 opacity-20" size={14} />
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Metric Accuracy: 99.1%</p>
         </div>
      </div>
    </div>
  );
};

export default KitchenIntelligence;
