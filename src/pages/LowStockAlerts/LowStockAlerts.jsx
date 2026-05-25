import React, { useState, useEffect, useCallback } from 'react';
import alertService from '../../services/alertService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaBell, 
  FaTrashAlt, 
  FaClock, 
  FaSearch,
  FaShieldAlt,
  FaFilter,
  FaArrowRight
} from 'react-icons/fa';

const LowStockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date);
    };

    const canView = user?.permissions?.includes('LOW_STOCK_ALERT_VIEW');

    const fetchAlerts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await alertService.getAlerts();
            // Assuming response.data is an array based on previous code
            setAlerts(Array.isArray(response.data) ? response.data : (response.data?.data || []));
        } catch (error) {
            toast.error('Failed to sync security alerts.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!canView) {
            navigate('/access-denied');
            return;
        }
        fetchAlerts();
    }, [canView, navigate, fetchAlerts]);

    const handleAcknowledge = async (id) => {
        try {
            await alertService.acknowledgeAlert(id);
            setAlerts(alerts.filter(alert => alert.alertId !== id));
            toast.success('Notification archived');
        } catch (error) {
            toast.error('Operation failed');
            console.error(error);
        }
    };

    const filteredAlerts = alerts.filter(alert => 
        alert.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!canView) return null;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-700 text-left max-w-7xl">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Inventory Alerts <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold text-sm uppercase tracking-widest">Real-time supply chain notifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
                        System Active
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full">
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute top-5 left-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden">
                {isLoading ? (
                    <div className="py-24 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning Data Streams...</p>
                    </div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="py-24 text-center px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <FaBell size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">System Status: Nominal</h3>
                        <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wider">No active stock or expiry alerts detected</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6">Notification Detail</th>
                                    <th className="px-8 py-6">Event Type</th>
                                    <th className="px-8 py-6">Timestamp</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAlerts.map((alert) => (
                                    <tr key={alert.alertId} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${alert.type === 0 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                                    {alert.type === 0 ? <FaExclamationTriangle /> : <FaClock />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-800 text-sm tracking-tight">{alert.message}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #{alert.alertId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                                                alert.type === 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                {alert.type === 0 ? 'Low Stock' : 'Expiry Alert'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700">{formatDate(alert.alertDate)}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{formatTime(alert.alertDate)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleAcknowledge(alert.alertId)}
                                                className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 inline-flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-6 py-2.5 rounded-xl hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest shadow-sm"
                                            >
                                                Clear <FaArrowRight size={10} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 px-4 text-left">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <FaShieldAlt className="text-emerald-500" /> 
                    AI Guard is monitoring all stock movements
                </div>
                <button 
                    onClick={fetchAlerts}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
                >
                    Refresh Notifications
                </button>
            </div>
        </div>
    );
};

export default LowStockAlerts;