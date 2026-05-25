import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { hasPermission, hasMenuPermission } from '../utils/permissionUtils';
import useSignalR from '../useSignalR';
import { toast } from 'react-toastify';
import kitchenService from '../services/kitchenService';
import { getAllStaff } from '../services/staffService';
import config from '../config';
import { 
  FaUtensils, 
  FaClock, 
  FaUser, 
  FaChair, 
  FaCheckCircle, 
  FaFire, 
  FaClipboardList,
  FaSyncAlt,
  FaChevronRight,
  FaHistory,
  FaUserCog
} from 'react-icons/fa';

export default function Kitchen() {
  const canViewKitchen = hasPermission('KITCHEN_VIEW') || hasMenuPermission('/kitchen');
  const canUpdateKitchen = hasPermission('KITCHEN_UPDATE') || hasMenuPermission('/kitchen');
  const { connection, isConnected, error: signalRError } = useSignalR(config.SIGNALR_HUB_URL);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(['Pending', 'Preparing', 'Ready']);
  
  const [staff, setStaff] = useState([]);
  const [activeChefId, setActiveChefId] = useState(localStorage.getItem('activeChefId') || '');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await kitchenService.getKitchenOrders(filterStatus);
      const responseData = response?.data || {};
      
      let items = [];
      if (Array.isArray(responseData)) {
        items = responseData;
      } else if (responseData.items && Array.isArray(responseData.items)) {
        items = responseData.items;
      } else if (responseData.Items && Array.isArray(responseData.Items)) {
        items = responseData.Items;
      }
      
      setOrders(items);
    } catch (err) {
      toast.error('Failed to sync kitchen display.');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await getAllStaff({ pageNumber: 1, pageSize: 1000, status: true });
        console.log("Kitchen: Staff API Response:", res.data);
        
        const responseData = res?.data?.data || res?.data || {};
        let items = [];
        
        if (Array.isArray(responseData)) {
          items = responseData;
        } else if (responseData.items && Array.isArray(responseData.items)) {
          items = responseData.items;
        } else if (responseData.Items && Array.isArray(responseData.Items)) {
          items = responseData.Items;
        }
        
        setStaff(items);
      } catch (err) {
        console.error("Staff fetch failed", err);
      }
    };

    if (canViewKitchen) {
      fetchOrders();
      fetchStaff();
    }
  }, [canViewKitchen, fetchOrders]);

  useEffect(() => {
    if (isConnected && connection) {
      connection.on("KitchenOrderUpdate", (update) => {
        toast.info(`Order #${update.orderId}: ${update.message}`, {
          icon: <FaFire className="text-orange-500" />
        });

        setOrders(prev => {
          const index = prev.findIndex(o => (o.orderID || o.orderId || o.id) === update.orderId);
          if (index > -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], orderStatus: update.orderStatus };
            if (update.orderStatus === 'Completed') return updated.filter((_, i) => i !== index);
            return updated;
          } else {
            if (filterStatus.includes(update.orderStatus)) {
              fetchOrders();
            }
            return prev;
          }
        });
      });
      return () => connection.off("KitchenOrderUpdate");
    }
  }, [isConnected, connection, filterStatus, fetchOrders]);

  const handleChefChange = (e) => {
    const id = e.target.value;
    setActiveChefId(id);
    localStorage.setItem('activeChefId', id);
    if (id) {
        const chef = staff.find(s => (s.staffID || s.staffId) === parseInt(id));
        toast.success(`Active Chef set to: ${chef?.staffName}`);
    }
  };

  const handleStatusUpdate = async (orderId, currentStatus) => {
    if (!canUpdateKitchen) return;
    
    const chefId = parseInt(activeChefId);
    if (isNaN(chefId)) {
        toast.warn("Please select your name from the 'Active Chef' list to track productivity AI.");
        return;
    }
    
    let nextStatus = '';
    if (currentStatus === 'Pending') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Ready';
    else if (currentStatus === 'Ready') nextStatus = 'Completed';

    if (!nextStatus) return;

    try {
      const response = await kitchenService.updateOrderStatus(orderId, nextStatus, chefId);
      if (response.data.isSuccess) {
        toast.success(`Order #${orderId} is now ${nextStatus}`);
        fetchOrders();
      }
    } catch (err) {
      toast.error("Operation failed.");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending': return { color: 'bg-amber-500', icon: <FaClock />, label: 'New Order', btn: 'bg-amber-600 hover:bg-amber-700', next: 'Start Cooking' };
      case 'Preparing': return { color: 'bg-blue-500', icon: <FaFire className="animate-pulse" />, label: 'Cooking', btn: 'bg-blue-600 hover:bg-blue-700', next: 'Mark Ready' };
      case 'Ready': return { color: 'bg-green-500', icon: <FaCheckCircle />, label: 'Ready', btn: 'bg-green-600 hover:bg-green-700', next: 'Mark Completed' };
      default: return { color: 'bg-gray-500', icon: <FaHistory />, label: status, btn: 'bg-gray-600', next: 'Done' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-xl shadow-orange-100">
              <FaUtensils className="text-white" />
            </div>
            Kitchen Display
          </h1>
          <p className="text-gray-400 mt-2 font-bold italic text-sm">Real-time order management & productivity tracking</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {/* ACTIVE CHEF SELECTOR - Visible on md screens and up */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 border-r border-gray-100 mr-2 group">
             <FaUserCog className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Active Chef</span>
                <select 
                    value={activeChefId}
                    onChange={handleChefChange}
                    className="bg-transparent text-xs font-black text-indigo-600 outline-none cursor-pointer appearance-none"
                >
                    <option value="">Identify Yourself...</option>
                    {staff.map(s => {
                      const sId = s.staffID ?? s.staffId ?? s.id;
                      return <option key={sId} value={sId}>{s.staffName}</option>;
                    })}
                </select>
             </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${isConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></div>
            {isConnected ? 'Live Sync Active' : 'Offline'}
          </div>
          <button 
            onClick={fetchOrders}
            className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-all hover:rotate-180"
          >
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {!canViewKitchen ? (
        <div className="bg-red-50 border-2 border-red-100 p-10 rounded-[2.5rem] text-center max-w-2xl mx-auto">
          <p className="text-red-700 font-black text-xl mb-2">Access Resticted</p>
          <p className="text-red-500 font-bold">You don't have the required credentials for Kitchen Management.</p>
        </div>
      ) : (
        <>
          {isLoading && orders.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="font-black text-gray-300 uppercase tracking-widest">Warming up the station...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <FaClipboardList size={64} className="text-gray-100 mx-auto mb-6" />
              <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No Active Orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
              {orders.map(order => {
                const id = order.orderID || order.orderId || order.id;
                const config = getStatusConfig(order.orderStatus);

                return (
                  <div key={id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    {/* CARD HEADER */}
                    <div className={`p-6 ${config.color} text-white`}>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">
                          #{id}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                          {config.icon}
                          {config.label}
                        </div>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight mb-1 flex items-center gap-2">
                        <FaChair className="text-lg opacity-60" />
                        {order.tableName || 'Take-Away'}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold opacity-80">
                        <span className="flex items-center gap-1"><FaUser size={10}/> {order.waiterName || 'Counter'}</span>
                        <span className="flex items-center gap-1"><FaClock size={10}/> {order.orderTime}</span>
                      </div>
                    </div>

                    {/* ITEMS LIST */}
                    <div className="p-8 flex-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Order Summary</div>
                      <ul className="space-y-4">
                        {order.orderDetails?.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4 group/item">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-black text-gray-500 text-xs border border-gray-100 group-hover/item:bg-orange-50 group-hover/item:text-orange-600 group-hover/item:border-orange-100 transition-colors">
                              {item.quantity}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-gray-800 tracking-tight leading-tight">{item.productName || item.product?.productName}</p>
                              {item.notes && <p className="text-[10px] text-red-500 font-bold italic mt-1">Note: {item.notes}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ACTIONS */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-50">
                      <button
                        onClick={() => handleStatusUpdate(id, order.orderStatus)}
                        className={`w-full py-4 rounded-2xl text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${config.btn}`}
                        disabled={order.orderStatus === 'Completed'}
                      >
                        {config.next}
                        <FaChevronRight className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ERROR OVERLAY */}
      {signalRError && (
        <div className="fixed bottom-10 left-10 right-10 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center justify-between font-black uppercase tracking-widest text-[10px]">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              Live updates disconnected: {signalRError}
            </div>
            <button onClick={() => window.location.reload()} className="bg-white text-red-500 px-4 py-2 rounded-lg">Reconnect</button>
          </div>
        </div>
      )}
    </div>
  );
}
