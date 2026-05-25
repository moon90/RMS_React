import React from 'react';
import { FaTerminal } from 'react-icons/fa';

const POSLayout = ({
  topBarButtons,
  productPanel,
  cartPanel,
}) => {
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden select-none">
      {/* SINGLE-ROW ALL-VISIBLE TOP BAR */}
      <div className="bg-[#1e293b] text-white grid grid-cols-[auto_1fr] items-center shadow-2xl z-50 w-full h-[80px] sm:h-[100px] lg:h-[120px] border-b border-white/5 overflow-hidden">
        
        {/* LOGO & TITLE SECTION - Optimized Fixed Column */}
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0 px-2 sm:px-6 lg:px-10 h-full bg-[#1e293b] relative z-30 border-r border-white/10 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
          <div className="p-1.5 sm:p-3 lg:p-4 bg-blue-600 rounded-lg sm:rounded-2xl lg:rounded-[1.5rem] shadow-xl">
            <FaTerminal className="text-xs sm:text-xl lg:text-2xl" />
          </div>
          <div className="flex flex-col min-w-fit">
            <h1 className="text-[9px] sm:text-lg lg:text-2xl font-black tracking-tighter uppercase leading-none">
              RMS<span className="hidden sm:inline"> TERMINAL</span>
            </h1>
          </div>
        </div>

        {/* BUTTONS CONTAINER - Strictly One Row, Optimized for Text Visibility */}
        <div className="flex items-center gap-0.5 sm:gap-2 lg:gap-4 px-1 sm:px-4 lg:px-8 h-full min-w-0 overflow-hidden">
          {topBarButtons.map((button, index) => (
            <button 
              key={index} 
              onClick={button.onClick} 
              className={`flex-1 min-w-0 h-[85%] flex flex-col items-center justify-center gap-0.5 sm:gap-2 px-0.5 sm:px-3 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-black transition-all hover:-translate-y-1 active:scale-95 border-b-2 sm:border-b-4 border-black/30 overflow-hidden ${
                button.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' :
                button.color === 'yellow' ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20' :
                button.color === 'purple' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' :
                button.color === 'green' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                button.color === 'orange' ? 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/20' :
                button.color === 'red' ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20' :
                button.color === 'black' ? 'bg-slate-900 hover:bg-black shadow-slate-900/20' :
                'bg-slate-700 hover:bg-slate-600 shadow-slate-700/20'
              }`}
            >
              <span className="text-[10px] sm:text-lg lg:text-2xl flex-shrink-0 leading-none">{button.icon}</span>
              <span className="text-[5.5px] sm:text-[9px] lg:text-[11px] uppercase tracking-tighter leading-[1.1] text-center w-full break-words sm:break-normal">
                {button.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN VIEWPORT */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* PRODUCT ARENA */}
        <div className="flex-1 lg:flex-[0.55] p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {productPanel}
        </div>

        {/* CART STATION */}
        <div className="h-[40vh] lg:h-auto lg:flex-[0.45] bg-white shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.05)] border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col overflow-hidden z-40">
          {cartPanel}
        </div>
      </div>
    </div>
  );
};

export default POSLayout;
