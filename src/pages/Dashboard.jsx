import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLowStockAlerts } from '../services/low-stock.service';
import { getDashboardStats } from '../services/dashboardService';
import { getAllOrders } from '../services/orderService';
import { Link } from 'react-router-dom';
import { FaChartLine, FaShoppingBag, FaUsers, FaTable, FaPlus, FaCashRegister, FaUtensils, FaArrowUp, FaArrowDown, FaChevronRight, FaBoxOpen, FaSync, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import RevenueChart from '../components/RevenueChart';
import MenuTrends from '../components/MenuTrends';
import AiPulse from '../components/AiPulse';
import StaffLeaderboard from '../components/StaffLeaderboard';
import LoyaltyLeaderboard from '../components/LoyaltyLeaderboard';
import KitchenIntelligence from '../components/KitchenIntelligence';
import { formatCurrency } from '../utils/currencyUtils';
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { t } = useTranslation();
  const [lowStockAlertCount, setLowStockAlertCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch Low Stock Alerts
    try {
        const alertsRes = await getLowStockAlerts();
        if (alertsRes.isSuccess) setLowStockAlertCount(alertsRes.data.length);
    } catch (e) {
        console.warn("Low stock alerts unavailable", e);
    }

    // Fetch Dashboard Stats
    try {
        const statsRes = await getDashboardStats();
        if (statsRes.data?.isSuccess) {
            setStats(statsRes.data.data);
        } else {
            toast.error("Analytics engine is temporarily offline");
        }
    } catch (e) {
        console.error("Dashboard stats error", e);
        toast.error("Network error: Dashboard out of sync");
    }

    // Fetch Recent Orders
    try {
        const ordersRes = await getAllOrders({ pageSize: 5 });
        if (ordersRes.data?.items) {
            setRecentOrders(ordersRes.data.items);
        }
    } catch (e) {
        console.warn("Recent orders unavailable", e);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    { 
        title: t('dashboard.stats.total_revenue'), 
        value: formatCurrency(stats?.stats?.totalRevenue, stats?.currencyCode, stats?.currencySymbol), 
        icon: FaChartLine, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        trend: `${stats?.stats?.revenueGrowth ?? 0}%`, 
        trendUp: (stats?.stats?.revenueGrowth ?? 0) >= 0 
    },
    { 
        title: t('dashboard.stats.daily_orders'), 
        value: stats?.stats?.totalOrders != null ? stats.stats.totalOrders.toLocaleString() : '0', 
        icon: FaShoppingBag, 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        trend: `${stats?.stats?.ordersGrowth ?? 0}%`, 
        trendUp: (stats?.stats?.ordersGrowth ?? 0) >= 0 
    },
    { 
        title: t('dashboard.stats.total_customers'), 
        value: stats?.stats?.totalCustomers != null ? stats.stats.totalCustomers.toLocaleString() : '0', 
        icon: FaUsers, 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        trend: 'Active', 
        trendUp: true 
    },
    { 
        title: t('dashboard.stats.avg_order'), 
        value: formatCurrency(stats?.stats?.averageOrderValue, stats?.currencyCode, stats?.currencySymbol), 
        icon: FaCashRegister, 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        trend: 'Stable', 
        trendUp: true 
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Preparing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Ready': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed':
      case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {t('sidebar.dashboard')} <div className={`w-2 h-2 rounded-full bg-emerald-500 animate-pulse`}></div>
          </h1>
          <p className="text-slate-500 mt-1 font-bold text-sm uppercase tracking-widest">{t('dashboard.welcome')}</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={fetchData}
            className="p-3 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:text-blue-500 hover:border-blue-100 transition-all shadow-sm active:scale-95"
          >
            <FaSync className={`${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/pos" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-6 py-3 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
            <FaCashRegister className="text-slate-400" /> POS Terminal
          </Link>
          <Link to="/pos" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest">
            <FaPlus /> New Order
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 mb-1 tracking-[0.15em] uppercase">{stat.title}</p>
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">{isLoading ? '...' : stat.value}</h3>
              </div>
              <div className={`p-3 md:p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon size={18} className="md:w-5 md:h-5" />
              </div>
            </div>
            <div className="mt-4 md:mt-6 flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trendUp ? <FaArrowUp /> : <FaArrowDown />}
                {stat.trend}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Revenue</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Today's hourly sales performance</p>
              </div>
              <div className="flex gap-2">
                 <span className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Real-time
                 </span>
              </div>
           </div>
           <div className="h-[250px] md:h-[300px]">
              <RevenueChart data={stats?.revenueTrend} currencySymbol={stats?.currencySymbol} />
           </div>
        </div>

        {/* Trending Items */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
           <div className="mb-6 md:mb-8">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Top Sellers</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Most popular menu items</p>
           </div>
           <MenuTrends items={stats?.trendingMenus} currencySymbol={stats?.currencySymbol} />
           <Link to="/sales/list" className="mt-8 w-full py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-50 hover:text-blue-500 transition-all flex items-center justify-center gap-2 group">
              Full Sales Report <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl md:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden flex flex-col">
          <div className="p-5 md:p-8 border-b border-slate-50 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Live Orders</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Latest activity in your POS</p>
            </div>
            <Link to="/orders/list" className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">View All</Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-5 md:px-8 py-4 md:py-5">Order ID</th>
                  <th className="px-5 md:px-8 py-4 md:py-5">Type / Table</th>
                  <th className="px-5 md:px-8 py-4 md:py-5">Amount</th>
                  <th className="px-5 md:px-8 py-4 md:py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-5 md:px-8 py-4 md:py-5 font-black text-slate-800">#{order.orderID}</td>
                    <td className="px-5 md:px-8 py-4 md:py-5 font-black text-slate-700 text-sm">{order.orderType}</td>
                    <td className="px-5 md:px-8 py-4 md:py-5 font-black text-slate-900 text-base">
                        {formatCurrency(order.total, stats?.currencyCode, stats?.currencySymbol)}
                    </td>
                    <td className="px-5 md:px-8 py-4 md:py-5 text-right">
                      <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                    <tr>
                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold italic">No live orders found.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Logistics & Alerts Column */}
        <div className="space-y-6 md:space-y-8 flex flex-col">
           {/* Inventory Health */}
           <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex-1">
              <h2 className="text-lg font-black text-slate-800 tracking-tight mb-6">Inventory Health</h2>
              <div className="space-y-5 md:space-y-6">
                 <div className="flex items-center justify-between p-4 bg-red-50 rounded-3xl border border-red-100">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-200">
                          <FaExclamationTriangle size={16} />
                       </div>
                       <div>
                          <p className="font-black text-red-600 text-[10px] uppercase tracking-widest">Low Stock Alerts</p>
                          <p className="text-xl font-black text-red-900 leading-tight">{lowStockAlertCount} Items</p>
                       </div>
                    </div>
                    <Link to="/inventory/low-stock" className="p-2 bg-white text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                       <FaChevronRight size={12} />
                    </Link>
                 </div>

                 <div className="p-5 md:p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Status</span>
                       <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                            (stats?.stats?.inventoryHealthPercentage ?? 100) > 70 ? 'text-emerald-600 bg-emerald-50' : 
                            (stats?.stats?.inventoryHealthPercentage ?? 100) > 40 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                       }`}>
                           {(stats?.stats?.inventoryHealthPercentage ?? 100) > 70 ? 'Healthy' : 
                            (stats?.stats?.inventoryHealthPercentage ?? 100) > 40 ? 'Attention' : 'Critical'}
                       </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 md:h-3 rounded-full overflow-hidden">
                       <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                            (stats?.stats?.inventoryHealthPercentage ?? 100) > 70 ? 'bg-slate-900' : 
                            (stats?.stats?.inventoryHealthPercentage ?? 100) > 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stats?.stats?.inventoryHealthPercentage ?? 100}%` }}
                       ></div>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 mt-4 leading-relaxed italic">
                       "{stats?.stats?.inventoryHealthPercentage ?? 100}% of your inventory is within safety margins. Reorder system is {(stats?.stats?.inventoryHealthPercentage ?? 100) > 70 ? 'active' : 'triggered'}."
                    </p>
                 </div>
              </div>
           </div>

           {/* Quick Actions */}
           <div className="bg-blue-600 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl shadow-blue-100 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div>
                <h3 className="text-lg font-black tracking-tight mb-2 relative z-10">Smart Logistics</h3>
                <p className="text-xs text-blue-100 font-medium mb-6 relative z-10">AI Restock restock is ready.</p>
              </div>
              <button className="w-full py-4 bg-white text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-50 transition-all shadow-lg relative z-10">
                 Run Auto-Audit
              </button>
           </div>
        </div>
      </div>

      {/* Intelligence & Logistics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mt-4 md:mt-10">
        <div className="xl:col-span-1">
            <StaffLeaderboard data={stats?.staffPerformance} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-2">
            <LoyaltyLeaderboard data={stats?.topCustomers} isLoading={isLoading} currencyCode={stats?.currencyCode} currencySymbol={stats?.currencySymbol} />
        </div>
        <div className="xl:col-span-1">
            <KitchenIntelligence data={stats?.kitchenProductivity} isLoading={isLoading} />
        </div>
        
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <AiPulse insights={stats?.aiInsights} isLoading={isLoading} />
          
          <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl flex flex-col text-white relative overflow-hidden h-full">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 relative z-10">Quick Ecosystem</h3>
             <div className="grid grid-cols-2 gap-4 relative z-10 flex-1">
                <Link to="/kitchen" className="flex flex-col justify-center items-center gap-3 p-4 md:p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                    <FaUtensils className="text-orange-400 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-300">Kitchen</span>
                </Link>
                <Link to="/inventory/list" className="flex flex-col justify-center items-center gap-3 p-4 md:p-5 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group">
                    <FaBoxOpen className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-300">Storage</span>
                </Link>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}

