import React from 'react';

const MenuTrends = ({ items, currencySymbol = '$' }) => {
  return (
    <div className="space-y-4">
      {items?.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border overflow-hidden flex items-center justify-center font-black text-slate-400 group-hover:text-blue-500 transition-colors">
              {item.thumbnailImage ? (
                <img src={`data:image/png;base64,${item.thumbnailImage}`} alt={item.productName} className="w-full h-full object-cover" />
              ) : (
                index + 1
              )}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{item.productName}</h4>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{currencySymbol}{(item.price ?? 0).toLocaleString()} · {item.orderCount ?? 0} orders</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Top {index + 1}</span>
          </div>
        </div>
      ))}
      {(!items || items.length === 0) && (
        <div className="text-center py-8">
           <p className="text-slate-400 font-bold text-sm italic">No data available for this period.</p>
        </div>
      )}
    </div>
  );
};

export default MenuTrends;
