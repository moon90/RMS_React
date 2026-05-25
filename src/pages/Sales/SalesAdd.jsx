import React, { useState, useEffect, useCallback } from 'react';
import { salesService } from '../../services/salesService';
import { getAllCategories } from '../../services/categoryService';
import { getAllCustomers } from '../../services/customerService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaChartBar, 
  FaSave, 
  FaUndo, 
  FaUserCircle, 
  FaMoneyBillWave, 
  FaTag, 
  FaCreditCard,
  FaCalendarAlt
} from 'react-icons/fa';

const SalesAdd = ({ isEdit, data, onSave, onClose, showTitle = true }) => {
  const [formData, setFormData] = useState({
    customerID: '',
    totalAmount: '',
    discountAmount: '0',
    finalAmount: '',
    paymentMethod: 'Cash',
    categoryId: '',
    saleDate: new Date().toISOString().split('T')[0]
  });

  const [dependencies, setDependencies] = useState({
    categories: [],
    customers: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const canModify = isEdit ? hasPermission('SALE_UPDATE') : hasPermission('SALE_CREATE');

  const fetchDependencies = useCallback(async () => {
    try {
      const [catRes, custRes] = await Promise.all([
        getAllCategories({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllCustomers({ pageNumber: 1, pageSize: 1000, status: true })
      ]);

      const updatedDeps = { categories: [], customers: [] };

      if (catRes.data && catRes.data.isSuccess) {
        const rawCats = catRes.data.data?.items || catRes.data.data || [];
        updatedDeps.categories = rawCats.map(c => ({
          id: c.categoryID || c.categoryId || c.CategoryID || c.id,
          name: c.categoryName || c.CategoryName || c.name
        }));
      }

      if (custRes.data && custRes.data.isSuccess) {
        const rawCusts = custRes.data.data?.items || custRes.data.data || [];
        updatedDeps.customers = rawCusts.map(c => ({
          id: c.customerID || c.customerId || c.CustomerID || c.id,
          name: c.customerName || c.CustomerName || c.name || `${c.firstName} ${c.lastName}`
        }));
      }

      setDependencies(updatedDeps);
    } catch (error) {
      console.error('Dependency sync failure:', error);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
    if (isEdit && data) {
      setFormData({
        customerID: data.customerID || data.CustomerID || '',
        totalAmount: data.totalAmount || data.TotalAmount || '',
        discountAmount: data.discountAmount || data.DiscountAmount || '0',
        finalAmount: data.finalAmount || data.FinalAmount || '',
        paymentMethod: data.paymentMethod || data.PaymentMethod || 'Cash',
        categoryId: data.categoryId || data.CategoryId || '',
        saleDate: (data.saleDate || data.SaleDate) ? (data.saleDate || data.SaleDate).split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [isEdit, data, fetchDependencies]);

  const calculateFinal = (total, discount) => {
    const t = parseFloat(total) || 0;
    const d = parseFloat(discount) || 0;
    return (t - d).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'totalAmount' || name === 'discountAmount') {
        updated.finalAmount = calculateFinal(updated.totalAmount, updated.discountAmount);
      }
      return updated;
    });
    if (errors[name.toLowerCase()]) setErrors(prev => ({ ...prev, [name.toLowerCase()]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canModify) {
      toast.error('Identity Authorization: Modification denied.');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        customerID: formData.customerID ? parseInt(formData.customerID) : null,
        totalAmount: parseFloat(formData.totalAmount),
        discountAmount: parseFloat(formData.discountAmount),
        finalAmount: parseFloat(formData.finalAmount),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        saleDetails: [], // Manual entry doesn't support item-level tracking yet
        splitPayments: []
      };

      const response = isEdit 
        ? await salesService.updateSale(data.saleID, payload)
        : await salesService.createSale(payload);

      if (response.data.isSuccess) {
        toast.success(`Sale ${isEdit ? 'updated' : 'saved'} successfully.`);
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        toast.error(response.data.message || 'Operation failed.');
      }
    } catch (error) {
      if (error.response?.data?.details) {
        const newErrors = {};
        error.response.data.details.forEach(err => {
          newErrors[err.propertyName.toLowerCase()] = err.errorMessage;
        });
        setErrors(newErrors);
        toast.error('Validation failure: Please check your entries.');
      } else {
        toast.error('Failed to save sale.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-1 ${showTitle ? 'max-w-4xl mx-auto' : ''} text-left`}>
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaChartBar className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{isEdit ? 'Edit Sale' : 'Add Sale'}</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manage sale details</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Customer</label>
              <div className="relative">
                <FaUserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="customerID"
                  value={formData.customerID}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 appearance-none"
                >
                  <option value="">Guest Customer</option>
                  {dependencies.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Category</label>
              <div className="relative">
                <FaTag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 appearance-none"
                >
                  <option value="">Select Category</option>
                  {dependencies.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Total Amount</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <input
                  type="number"
                  step="0.01"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 ${errors.totalamount ? 'border-red-400' : 'border-transparent'} rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700`}
                  required
                />
              </div>
              {errors.totalamount && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.totalamount}</p>}
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Discount</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 opacity-50" />
                <input
                  type="number"
                  step="0.01"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block text-green-600">Final Amount</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-5 top-1/2 -translate-y-1/2 text-green-300" />
                <input
                  type="number"
                  readOnly
                  value={formData.finalAmount}
                  placeholder="0.00"
                  className="w-full pl-14 pr-6 py-4 bg-green-50/50 border-2 border-transparent rounded-2xl outline-none font-black text-green-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Payment Method</label>
              <div className="relative">
                <FaCreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 appearance-none"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Online">Online</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Sale Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <input
                  type="date"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { if(onClose) onClose(); }}
              className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center gap-2"
            >
              <FaUndo /> Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default SalesAdd;
