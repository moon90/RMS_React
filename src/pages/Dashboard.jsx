import React, { useState, useEffect } from 'react';
import { getLowStockAlerts } from '../services/low-stock.service';
import { Link } from 'react-router-dom';
import { FaChartLine, FaShoppingBag, FaUsers, FaTable, FaPlus, FaCashRegister, FaUtensils, FaArrowUp, FaArrowDown, FaChevronRight, FaBoxOpen } from 'react-icons/fa';

export default function Dashboard() {
  const [lowStockAlertCount, setLowStockAlertCount] = useState(0);

  useEffect(() => {
    const fetchLowStockAlerts = async () => {
      try {
        const response = await getLowStockAlerts();
        if (response.isSuccess) {
          setLowStockAlertCount(response.data.length);
        }
      } catch (error) {
        console.error("Error fetching low stock alerts for dashboard:", error);
      }
    };

    fetchLowStockAlerts();
  }, []);

  const statCards = [
    { title: 'Total Revenue', value: '$4,289.00', icon: FaChartLine, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%', trendUp: true },
    { title: 'Active Orders', value: '34', icon: FaShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.2%', trendUp: true },
    { title: 'Total Customers', value: '1,240', icon: FaUsers, color: 'text-purple-600', bg: 'bg-purple-50', trend: '-1.4%', trendUp: false },
    { title: 'Available Tables', value: '12 / 40', icon: FaTable, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Optimal', trendUp: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/pos" className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all font-semibold">
            <FaCashRegister className="text-gray-500" /> POS Terminal
          </Link>
          <Link to="/orders/add" className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold border border-red-600">
            <FaPlus /> New Order
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1 tracking-wide">{stat.title}</p>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit ${stat.trendUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trendUp ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
                {stat.trend}
              </span>
              <span className="text-xs font-medium text-gray-400">vs yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
            <h2 className="text-xl font-extrabold text-gray-800">Recent Live Orders</h2>
            <Link to="/orders/list" className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors">View All</Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer / Table</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { id: '#ORD-0092', target: 'Table 4', amount: '$45.00', status: 'Preparing', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                  { id: '#ORD-0091', target: 'Walk-in', amount: '$12.50', status: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                  { id: '#ORD-0090', target: 'Table 12', amount: '$89.00', status: 'Ready', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { id: '#ORD-0089', target: 'Online Delivery', amount: '$124.00', status: 'Dispatched', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                ].map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-800">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-600">{order.target}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${order.color}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Quick Links */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-gray-800">Inventory Alerts</h2>
            {lowStockAlertCount > 0 && (
              <span className="bg-red-100 border border-red-200 text-red-700 px-2.5 py-1 rounded-md text-xs font-black shadow-sm">{lowStockAlertCount}</span>
            )}
          </div>

          {lowStockAlertCount > 0 ? (
            <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-5 flex gap-4 items-start relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 w-1.5 h-full bg-red-500 rounded-l-2xl"></div>
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-red-100 z-10">
                <FaUtensils className="text-red-500 w-5 h-5" />
              </div>
              <div className="z-10">
                <h4 className="font-extrabold text-red-900 text-sm">Low Stock Warning</h4>
                <p className="text-xs font-medium text-red-700 mt-1 leading-relaxed">You have {lowStockAlertCount} items running critically low on stock.</p>
                <Link to="/low-stock-alerts" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-red-600 hover:text-red-800 transition-colors">
                  Review Inventory <FaChevronRight className="text-[10px]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-white p-4 rounded-full shadow-sm border border-emerald-100 inline-flex mb-3">
                <FaChartLine className="text-emerald-500 w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-emerald-900">Stock is Optimal</h4>
              <p className="text-sm font-medium text-emerald-700 mt-1">No critical low stock alerts at this time.</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Quick Shortcuts</h3>
             <div className="space-y-3">
                <Link to="/kitchen" className="flex items-center justify-between p-3 rounded-2xl hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-200 transition-colors shadow-sm"><FaUtensils className="w-4 h-4" /></div>
                    <span className="font-bold text-gray-700 group-hover:text-orange-900">Kitchen Display</span>
                  </div>
                  <FaChevronRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                </Link>
                <Link to="/inventory/list" className="flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-200 transition-colors shadow-sm"><FaBoxOpen className="w-4 h-4" /></div>
                    <span className="font-bold text-gray-700 group-hover:text-blue-900">Manage Inventory</span>
                  </div>
                  <FaChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}