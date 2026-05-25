import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllOrders, deleteOrder } from '../../services/orderService';
import { toast } from 'react-toastify';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { hasPermission } from '../../utils/permissionUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaClipboardList,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaMoneyBillWave,
  FaEye,
  FaClock as FaHistory
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('OrderID');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { selectedBranch } = useAuth();

  const canCreate = hasPermission('ORDER_CREATE');
  const canUpdate = hasPermission('ORDER_UPDATE');
  const canDelete = hasPermission('ORDER_DELETE');
  const canView = hasPermission('ORDER_VIEW');

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: filters.status || null,
      };
      const response = await getAllOrders(params);
      if (response.data && response.data.isSuccess) {
        const responseData = response?.data?.data?.data || response?.data?.data || response?.data || {};
        
        let items = [];
        if (Array.isArray(responseData)) {
          items = responseData;
        } else if (responseData.items && Array.isArray(responseData.items)) {
          items = responseData.items;
        } else if (responseData.Items && Array.isArray(responseData.Items)) {
          items = responseData.Items;
        }

        setOrders(items);
        const total = responseData.totalRecords || responseData.TotalRecords || responseData.totalCount || responseData.TotalCount || items.length;
        setTotalOrders(total);
      } else {
        toast.error('Failed to synchronize order logs.');
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      toast.error('Critical failure: Order registry unreachable.');
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, filters.status]);

  useEffect(() => {
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    fetchOrders();
  }, [fetchOrders, canView, navigate]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (isLoading) return;
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    
    toast(({ closeToast }) => (
      <div className="p-1">
        <p className="text-sm font-bold text-gray-800 mb-3">Delete this order permanently?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await deleteOrder(id);
                if (response.data.isSuccess) {
                  toast.success('Order deleted successfully');
                  fetchOrders();
                } else {
                  toast.error(response.data.message || 'Void rejected by system');
                }
              } catch (err) {
                const detailedMsg = err.response?.data?.message || err.response?.data?.Message || err.message || 'Operational locks in place';
                toast.error(`Cannot void order: ${detailedMsg}`);
              }
              closeToast();
            }}
            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { autoClose: false, closeOnClick: false });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'held':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'cancelled':
      case 'void':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'ready':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'preparing':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FaClipboardList className="text-blue-600" />
            Order List
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Track and manage your orders</p>
        </div>
        
        {canCreate && (
          <button
            onClick={() => navigate('/orders/add')}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            <FaPlus /> Add Order
          </button>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative group flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm group-hover:shadow-md font-bold text-gray-700"
            onChange={handleSearchChange}
          />
          <FaSearch className="absolute top-5 left-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <FaFilter className="absolute left-4 top-5 text-gray-400 pointer-events-none" />
            <select 
              name="status" 
              className="pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 cursor-pointer shadow-sm hover:shadow-md transition-all appearance-none"
              onChange={handleFilter}
              value={filters.status}
            >
              <option value="">Status: ALL</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Held">Held</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort('OrderID')}>Order Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer & Total</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kitchen Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan="6" className="py-20 text-center"><div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div><p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Registry...</p></td></tr>
              ) : orders.length > 0 ? (
                orders.map((order, index) => {
                  const oId = order.orderID || order.orderId || order.id || order.Id;
                  const oDate = order.orderDate || order.OrderDate;
                  const oTime = order.orderTime || order.OrderTime;
                  const oStatus = order.orderStatus || order.OrderStatus;
                  const pStatus = order.paymentStatus || order.PaymentStatus;
                  const oTotal = order.total || order.Total || 0;
                  const cName = order.customer?.customerName || order.Customer?.customerName || 'Walk-in Client';

                  return (
                    <tr key={oId || index} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 font-black shadow-inner border-2 border-white ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all">
                              <FaClipboardList />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-gray-800 text-sm tracking-tight uppercase">Order #{oId}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.orderType || order.OrderType || 'Standard'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <span className="flex items-center gap-2"><FaCalendarAlt className="text-gray-300" /> {oDate ? new Date(oDate).toLocaleDateString() : 'N/A'}</span>
                          <span className="flex items-center gap-2"><FaClock className="text-gray-300" /> {oTime}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-700 flex items-center gap-2 uppercase tracking-tighter"><FaUser className="text-blue-200" /> {cName}</span>
                          <span className="text-sm font-black text-blue-600 mt-1 flex items-center gap-2"><FaMoneyBillWave className="text-blue-300 text-xs" /> {formatCurrency(oTotal, selectedBranch?.currencyCode, selectedBranch?.currencySymbol)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm ${getStatusStyle(oStatus)}`}>
                          {oStatus === 'Completed' || oStatus === 'Ready' ? <FaCheckCircle /> : <FaHistory />}
                          {oStatus}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {pStatus === 'Paid' ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm">
                            <FaCheckCircle size={10} /> Paid
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest">
                            <FaTimesCircle size={10} /> Unpaid
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => navigate(`/orders/detail/${oId}`)} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-500 hover:shadow-xl transition-all hover:scale-110 shadow-sm" title="View Details"><FaEye /></button>
                          {canUpdate && (
                            <button onClick={() => navigate(`/orders/edit/${oId}`)} className="p-3 bg-white border border-gray-100 rounded-xl text-blue-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaEdit /></button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(oId)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-600 hover:shadow-xl transition-all hover:scale-110 shadow-sm"><FaTrashAlt /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-300">
                      <FaClipboardList size={60} />
                      <p className="text-xl font-black uppercase tracking-widest text-gray-300">No Orders Recorded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION SECTION */}
      <div className="mt-8">
        <ProfessionalPagination
          count={totalOrders}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setItemsPerPage}
        />
      </div>

    </div>
  );
}