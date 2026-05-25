import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/orderService';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { useAuth } from '../../context/AuthContext';
import kitchenService from '../../services/kitchenService';
import ReceiptTemplate from '../../components/ReceiptTemplate';
import { systemSettingService } from '../../services/systemSettingService';
import { 
  FaClipboardList, 
  FaArrowLeft, 
  FaEdit, 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaUtensils, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaTimesCircle,
  FaReceipt,
  FaTags,
  FaPrint as FaPrinter
} from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState([]);
  const { user, selectedBranch } = useAuth();
  const navigate = useNavigate();
  const receiptRef = useRef();
  
  const currencySymbol = selectedBranch?.currencySymbol || '৳';

  const canEdit = user?.permissions?.includes('ORDER_UPDATE');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [orderRes, settingsRes] = await Promise.all([
          getOrderById(id),
          systemSettingService.getAllSettings()
        ]);

        if (orderRes.data && orderRes.data.data) {
          setOrder(orderRes.data.data);
        }
        
        if (settingsRes && settingsRes.isSuccess) {
          setSystemSettings(settingsRes.data || []);
        }
      } catch (err) {
        toast.error("Failed to synchronize order details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => {
    if (receiptRef.current) {
      receiptRef.current.print();
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Protocol Data...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-300 gap-4">
        <FaClipboardList size={60} />
        <p className="text-xl font-black uppercase tracking-widest">Protocol ID Not Found</p>
        <button onClick={() => navigate('/orders/list')} className="text-blue-600 font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:underline"><FaArrowLeft /> Return to Registry</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-6xl text-left">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/orders/list')} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-blue-600 hover:shadow-lg transition-all shadow-sm">
          <FaArrowLeft /> Back to List
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:border-slate-200 transition-all">
            <FaPrinter /> Print Receipt
          </button>
          {canEdit && (
            <button onClick={() => navigate(`/orders/edit/${order.orderID}`)} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
              <FaEdit /> Edit Order
            </button>
          )}
        </div>
      </div>

      <FormCard>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-gray-50">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-50 rounded-3xl shadow-inner text-blue-600">
              <FaReceipt size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Order #{order.orderID}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaCalendarAlt className="text-blue-200" /> {new Date(order.orderDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaClock className="text-blue-200" /> {order.orderTime}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <div className={`px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-[0.2em] shadow-sm flex items-center gap-3 ${getStatusStyle(order.orderStatus)}`}>
               {order.orderStatus === 'Completed' || order.orderStatus === 'Paid' ? <FaCheckCircle /> : <FaTimesCircle />}
               Kitchen: {order.orderStatus}
             </div>
             <div className={`px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-[0.2em] shadow-sm flex items-center gap-3 ${order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
               {order.paymentStatus === 'Paid' ? <FaCheckCircle /> : <FaMoneyBillWave />}
               Payment: {order.paymentStatus || 'Unpaid'}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Client Details */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ml-1">Customer Info</h3>
            <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4">
               <div className="flex items-center gap-3">
                 <FaUser className="text-blue-400" />
                 <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</p>
                   <p className="font-black text-gray-800 uppercase tracking-tight">{order.customer?.customerName || 'Anonymous Guest'}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3 pt-3 border-t border-white/50">
                 <FaUtensils className="text-blue-400" />
                 <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff & Table</p>
                   <p className="font-black text-gray-800 uppercase tracking-tight">{order.waiterName || 'N/A'} • {order.tableName || 'Take-Out'}</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Type & Logistics */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ml-1">Order Details</h3>
            <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col gap-4">
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                 <p className="font-black text-gray-800 uppercase tracking-tight mt-1">{order.orderType || 'Standard'}</p>
               </div>
               <div className="pt-3 border-t border-white/50">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</p>
                 <p className="font-black text-indigo-600 uppercase tracking-tight mt-1 font-black">{order.paymentMethod || 'Not Settled'}</p>
               </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ml-1">Payment Summary</h3>
            <div className="p-6 bg-blue-600 rounded-[2.5rem] shadow-xl shadow-blue-500/20 text-white flex flex-col gap-4">
               <div>
                 <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Aggregate Total</p>
                 <p className="text-3xl font-black tracking-tighter mt-1">{currencySymbol}{(order.total + (order.tipAmount || 0)).toLocaleString()}</p>
               </div>
               <div className="flex justify-between items-end pt-3 border-t border-blue-500">
                  <div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Order Val</p>
                    <p className="font-black">{currencySymbol}{(order.total ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Gratuity (Tip)</p>
                    <p className="font-black">{currencySymbol}{(order.tipAmount ?? 0).toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Order Details Matrix */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <FaTags className="text-blue-600" />
             <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Order Items</h3>
          </div>
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {order.orderDetails?.map((detail, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-5 font-black text-gray-700 uppercase tracking-tight text-sm">{detail.productName ?? detail.product?.productName ?? 'Unidentified Component'}</td>
                    <td className="px-8 py-5 text-center font-black text-gray-500 text-sm">×{detail.quantity ?? 1}</td>
                    <td className="px-8 py-5 font-black text-gray-500 text-sm">{currencySymbol}{(detail.price ?? 0).toLocaleString()}</td>
                    <td className="px-8 py-5 text-right font-black text-blue-600 text-sm">{currencySymbol}{(detail.amount ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        {order.discountAmount > 0 && (
          <div className="mt-8 flex justify-end">
            <div className="px-8 py-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-6">
               <div>
                 <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Discount</p>
                 <p className="font-black text-orange-600">{currencySymbol}{order.discountAmount.toLocaleString()}</p>
               </div>
               <div className="w-[1px] h-8 bg-orange-200"></div>
               <div>
                 <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Rate</p>
                 <p className="font-black text-orange-600">{order.discountPercentage}%</p>
               </div>
            </div>
          </div>
        )}
      </FormCard>

      <ReceiptTemplate ref={receiptRef} order={order} settings={systemSettings} />
    </div>
  );
};

export default OrderDetail;
