import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBrain, FaRobot, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaBolt } from 'react-icons/fa';

const AiPulse = ({ insights, isLoading }) => {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded-lg mb-8"></div>
        <div className="space-y-4">
          <div className="h-24 bg-white/5 rounded-3xl"></div>
          <div className="h-24 bg-white/5 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'Warning': return <FaExclamationTriangle className="text-amber-400" />;
      case 'Success': return <FaCheckCircle className="text-emerald-400" />;
      default: return <FaInfoCircle className="text-blue-400" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl text-white relative overflow-hidden flex flex-col h-full">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

      <div className="flex justify-between items-center mb-8 md:mb-10 relative z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2.5 md:p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/10">
            <FaBrain className="text-white text-lg md:text-xl animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black tracking-tight">{t('dashboard.ai_pulse.title')}</h2>
            <div className="flex items-center gap-2 mt-0.5 md:mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('dashboard.ai_pulse.status')}</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
           <FaBolt className="text-amber-400" size={10} /> V2.0
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-3 md:space-y-4">
        {(!insights || insights.length === 0) ? (
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 md:p-8 text-center">
            <FaRobot size={30} className="text-slate-700 mx-auto mb-4 opacity-50 md:w-10 md:h-10" />
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Processing Data Streams...</p>
            <p className="text-[9px] md:text-[10px] text-slate-600 mt-2 italic font-bold tracking-tight">No anomalies detected.</p>
          </div>
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-5 transition-all duration-500 cursor-default">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                  <div className="text-sm md:text-base">
                    {getIcon(insight.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-black text-xs md:text-sm tracking-tight truncate">{insight.title}</h4>
                    <span className={`flex-shrink-0 px-1.5 py-0.5 rounded-lg text-[7px] md:text-[8px] font-black uppercase border ${getImpactColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors line-clamp-2">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/5 relative z-10">
        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 md:gap-3">
          <FaLightbulb size={12} /> {t('dashboard.ai_pulse.scan')}
        </button>
      </div>
    </div>
  );
};

export default AiPulse;
