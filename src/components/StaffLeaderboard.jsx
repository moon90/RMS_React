import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserTie, FaCrown, FaStar, FaArrowUp, FaChartBar, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currencyUtils';

const StaffLeaderboard = ({ data, isLoading }) => {
  const { t } = useTranslation();
  const { selectedBranch } = useAuth();

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

  const getTagStyle = (tag) => {
    switch (tag) {
      case 'Elite Performer': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Upsell Master': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    }
  };

  const getIcon = (tag) => {
    switch (tag) {
      case 'Elite Performer': return <FaCrown className="text-amber-500" />;
      case 'Upsell Master': return <FaStar className="text-blue-500" />;
      default: return <FaArrowUp className="text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 md:mb-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2.5 md:p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
            <FaUserTie className="text-white text-lg md:text-xl" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-800">{t('dashboard.staff_leaderboard.title')}</h2>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{t('dashboard.staff_leaderboard.subtitle')}</p>
          </div>
        </div>
        <div className="p-2 bg-gray-50 rounded-xl">
           <FaChartBar className="text-slate-300" size={14} />
        </div>
      </div>

      <div className="flex-1 space-y-3 md:space-y-4">
        {(!data || data.length === 0) ? (
          <div className="py-10 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Gathering team data...</p>
          </div>
        ) : (
          data.map((staff, idx) => (
            <div key={idx} className="group flex items-center justify-between p-3 md:p-4 rounded-2xl md:rounded-3xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-base md:text-lg shadow-inner group-hover:bg-white transition-colors">
                    {staff?.staffName?.charAt(0) || 'S'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-0.5 md:p-1 rounded-lg shadow-sm">
                    <div className="text-[8px] md:text-[10px]">
                        {getIcon(staff.performanceTag)}
                    </div>
                  </div>
                </div>
                <div className="max-w-[80px] md:max-w-none">
                  <h4 className="font-black text-xs md:text-sm text-slate-800 tracking-tight truncate">{staff?.staffName || 'Staff Member'}</h4>
                  <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                    <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-wider truncate">{staff.role}</span>
                    <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="hidden sm:flex text-[8px] md:text-[9px] font-bold text-slate-400 items-center gap-1 uppercase tracking-wider truncate">
                        <FaMapMarkerAlt size={7} /> {staff.branchName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="font-black text-sm md:text-base text-slate-900 tracking-tight">
                    {formatCurrency(staff.totalRevenue, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}
                </p>
                <span className={`inline-block px-1.5 py-0.5 rounded-lg text-[7px] md:text-[8px] font-black uppercase border mt-0.5 md:mt-1 ${getTagStyle(staff.performanceTag)}`}>
                    {staff.performanceTag}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-50">
        <button className="w-full py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-800 transition-all flex items-center justify-center gap-2 group">
          View Global Standings <FaArrowUp size={10} className="rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default StaffLeaderboard;
