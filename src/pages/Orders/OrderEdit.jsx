import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrder } from '../../services/orderService';
import { getAllCustomers } from '../../services/customerService';
import { getAllProducts } from '../../services/productService';
import { getAllDiningTables } from '../../services/diningTableService';
import { getAllStaff } from '../../services/staffService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import FormCard from '../../components/FormCard.jsx';
import { 
  FaClipboardList, 
  FaSave, 
  FaUndo, 
  FaPlus, 
  FaTrashAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaUtensils, 
  FaBoxOpen,
  FaMoneyBillWave,
  FaTags,
  FaArrowLeft
} from 'react-icons/fa';

const OrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    orderID: id,
    orderDate: '',
    orderTime: '',
    tableName: '',
    waiterName: '',
    orderStatus: '',
    orderType: '',
    paymentStatus: '',
    paymentMethod: '',
    total: 0,
    discountAmount: 0,
    discountPercentage: 0,
    promotionID: null,
    received: 0,
    changeAmount: 0,
    tipAmount: 0,
    driverID: null,
    customerID: null,
    orderDetails: [],
  });

  const [dependencies, setDependencies] = useState({
    customers: [],
    products: [],
    diningTables: [],
    staff: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { selectedBranch } = useAuth();
  const currencySymbol = selectedBranch?.currencySymbol || '৳';

  const canEdit = user?.permissions?.includes('ORDER_UPDATE');

  const fetchDependencies = useCallback(async () => {
    try {
      const [customersRes, productsRes, tablesRes, staffRes] = await Promise.all([
        getAllCustomers({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllProducts({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllDiningTables({ pageNumber: 1, pageSize: 1000 }),
        getAllStaff({ pageNumber: 1, pageSize: 1000, status: true })
      ]);

      setDependencies({
        customers: customersRes.data?.data?.items || customersRes.data?.items || [],
        products: productsRes.data?.data?.items || productsRes.data?.items || [],
        diningTables: tablesRes.data?.data?.items || tablesRes.data?.items || [],
        staff: staffRes.data?.data?.items || staffRes.data?.items || []
      });
    } catch (error) {
      console.error("Dependency sync failure:", error);
    }
  }, []);

  const fetchOrderData = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchDependencies();
      const response = await getOrderById(id);
      if (response.data && response.data.data) {
        const orderData = response.data.data;
        const formattedDate = orderData.orderDate ? new Date(orderData.orderDate).toISOString().split('T')[0] : '';
        
        setFormData({
          ...orderData,
          orderDate: formattedDate,
          tableName: orderData.tableName || '',
          waiterName: orderData.waiterName || '',
          paymentStatus: orderData.paymentStatus || '',
          paymentMethod: orderData.paymentMethod || '',
          tipAmount: orderData.tipAmount || 0,
          orderDetails: orderData.orderDetails.map(detail => ({
            ...detail,
            productID: detail.productID,
            quantity: detail.quantity,
            price: detail.price,
            amount: detail.amount
          }))
        });
      }
    } catch (err) {
      toast.error("Failed to synchronize order protocol.");
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchDependencies]);

  useEffect(() => {
    if (!canEdit) {
      navigate('/access-denied');
      return;
    }
    fetchOrderData();
  }, [canEdit, navigate, fetchOrderData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'waiterName') {
      const selectedStaff = dependencies.staff.find(s => s.staffName === value);
      setFormData(prev => ({ 
        ...prev, 
        waiterName: value,
        staffID: selectedStaff ? selectedStaff.staffID : null 
      }));
    } else {
      const val = (name === 'tipAmount' || name === 'discountAmount' || name === 'received') ? parseFloat(value) || 0 : value;
      setFormData(prev => ({ ...prev, [name]: val }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleOrderDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...formData.orderDetails];
    
    if (name === 'productID') {
      const product = dependencies.products.find(p => (p.id || p.productID) === parseInt(value));
      newDetails[index] = {
        ...newDetails[index],
        productID: parseInt(value),
        price: product ? product.productPrice : 0,
        productName: product ? product.productName : '',
        amount: (newDetails[index].quantity || 1) * (product ? product.productPrice : 0)
      };
    } else {
      const val = (name === 'quantity' || name === 'price' || name === 'discountPrice') ? parseFloat(value) || 0 : value;
      newDetails[index] = { ...newDetails[index], [name]: val };
      
      if (name === 'quantity' || name === 'price' || name === 'discountPrice') {
        newDetails[index].amount = (newDetails[index].quantity * newDetails[index].price) - (newDetails[index].discountPrice || 0);
      }
    }

    const newTotal = newDetails.reduce((sum, item) => sum + (item.amount || 0), 0);
    setFormData(prev => ({ ...prev, orderDetails: newDetails, total: newTotal }));
  };

  const addOrderDetail = () => {
    setFormData(prev => ({
      ...prev,
      orderDetails: [...prev.orderDetails, { productID: '', quantity: 1, price: 0, discountPrice: 0, amount: 0 }]
    }));
  };

  const removeOrderDetail = (index) => {
    const newDetails = formData.orderDetails.filter((_, i) => i !== index);
    const newTotal = newDetails.reduce((sum, item) => sum + (item.amount || 0), 0);
    setFormData(prev => ({ ...prev, orderDetails: newDetails, total: newTotal }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.orderType) newErrors.orderType = "Protocol Type Required";
    if (formData.orderDetails.length === 0) newErrors.orderDetails = "Minimum 1 Item Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        orderDate: new Date(formData.orderDate).toISOString(),
      };
      const response = await updateOrder(id, payload);
      if (response.data.isSuccess) {
        toast.success("Order protocol updated successfully.");
        navigate('/orders/list');
      } else {
        toast.error(response.data.message || "Protocol rejection by server.");
      }
    } catch (error) {
      toast.error("Critical failure: Order service unreachable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Syncing Operational Protocol...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-6xl text-left">
      <div className="mb-8">
        <button onClick={() => navigate('/orders/list')} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-blue-600 hover:shadow-lg transition-all shadow-sm">
          <FaArrowLeft /> Registry Return
        </button>
      </div>

      <FormCard>
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
            <FaClipboardList className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Modify Protocol #{formData.orderID}</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Operational Protocol Refinement</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* CORE SPECS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Entry Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <input type="date" name="orderDate" value={formData.orderDate} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-700 focus:border-blue-100 focus:bg-white transition-all" required />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Entry Time</label>
              <div className="relative">
                <FaClock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <input type="time" name="orderTime" value={formData.orderTime} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-700 focus:border-blue-100 focus:bg-white transition-all" required />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Protocol Type</label>
              <div className="relative">
                <FaUtensils className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select name="orderType" value={formData.orderType} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 focus:bg-white transition-all" required>
                  <option value="">Select Protocol</option>
                  <option value="DineIn">Dine-In</option>
                  <option value="TakeOut">Take-Out</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Lifecycle Status</label>
              <div className="relative">
                <FaTags className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select name="orderStatus" value={formData.orderStatus} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 focus:bg-white transition-all">
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Served">Served</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* LOGISTICAL HOOKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Client Identity</label>
              <div className="relative">
                <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select name="customerID" value={formData.customerID || ''} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 focus:bg-white transition-all">
                  <option value="">Guest Client</option>
                  {dependencies.customers.map(c => <option key={c.customerID} value={c.customerID}>{c.customerName}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Operational Table</label>
              <div className="relative">
                <FaUtensils className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select name="tableName" value={formData.tableName} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 focus:bg-white transition-all">
                  <option value="">No Table</option>
                  {dependencies.diningTables.map(t => <option key={t.diningTableID} value={t.tableName}>{t.tableName}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Service Lead (Waiter)</label>
              <div className="relative">
                <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select name="waiterName" value={formData.waiterName} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 focus:bg-white transition-all">
                  <option value="">Unassigned</option>
                  {dependencies.staff.map(s => <option key={s.staffID} value={s.staffName}>{s.staffName}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* FINANCIAL HOOKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Payment Status</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 focus:bg-white transition-all">
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="PartiallyPaid">Partially Paid</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Payment Method</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 focus:bg-white transition-all">
                  <option value="">N/A</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="MobilePay">MobilePay</option>
                  <option value="Split">Split Payment</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Gratuity (Tip)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currencySymbol}</span>
                <input type="number" name="tipAmount" value={formData.tipAmount} onChange={handleInputChange} className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none font-bold text-gray-700 focus:border-blue-100 focus:bg-white transition-all" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* LINE ITEMS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2"><FaBoxOpen /> Order Matrix</h3>
              <button type="button" onClick={addOrderDetail} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2 shadow-sm"><FaPlus /> Add Component</button>
            </div>
            
            <div className="space-y-4">
              {formData.orderDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 items-center animate-scale-in">
                  <div className="md:col-span-4 relative group">
                    <select name="productID" value={detail.productID} onChange={(e) => handleOrderDetailChange(index, e)} className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest text-gray-600 appearance-none focus:border-blue-100 shadow-sm transition-all" required>
                      <option value="">Select Item</option>
                      {dependencies.products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 relative group">
                    <input type="number" name="quantity" value={detail.quantity} onChange={(e) => handleOrderDetailChange(index, e)} className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl outline-none font-black text-center text-[10px] uppercase tracking-widest text-gray-600 focus:border-blue-100 shadow-sm transition-all" placeholder="Qty" min="1" required />
                  </div>
                  <div className="md:col-span-2 relative group">
                    <input type="number" name="price" value={detail.price} onChange={(e) => handleOrderDetailChange(index, e)} className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl outline-none font-black text-center text-[10px] uppercase tracking-widest text-blue-600 focus:border-blue-100 shadow-sm transition-all" placeholder="Price" required />
                  </div>
                  <div className="md:col-span-3 text-right pr-4">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Total Component Val</span>
                    <span className="text-lg font-black text-gray-800 tracking-tighter">{currencySymbol}{detail.amount?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button type="button" onClick={() => removeOrderDetail(index)} className="p-4 bg-white text-red-400 rounded-2xl hover:text-red-600 hover:shadow-lg transition-all shadow-sm border border-gray-100"><FaTrashAlt /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY & ACTIONS */}
          <div className="flex flex-col md:flex-row items-end justify-between pt-10 border-t border-gray-100 gap-8">
            <div className="flex flex-col items-start gap-4">
               <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 min-w-[300px]">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Aggregate Total</span>
                   <FaMoneyBillWave className="text-blue-200" />
                 </div>
                 <h2 className="text-4xl font-black text-blue-600 tracking-tighter">{currencySymbol}{(formData.total + formData.tipAmount).toLocaleString()}</h2>
                 <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-2">Inc. {currencySymbol}{formData.tipAmount} gratuity</p>
               </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/orders/list')} className="px-10 py-5 bg-gray-50 text-gray-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center gap-3"><FaUndo /> Revert State</button>
              <button type="submit" disabled={isSubmitting} className="px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50"><FaSave /> {isSubmitting ? 'Syncing...' : 'Commit Protocol'}</button>
            </div>
          </div>

        </form>
      </FormCard>
    </div>
  );
};

export default OrderEdit;
