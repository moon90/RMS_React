import React, { useState, useEffect, useCallback } from 'react';
import { purchaseService } from '../../services/purchaseService';
import { getAllSuppliers } from '../../services/supplierService';
import { getAllCategories } from '../../services/categoryService';
import { getAllProducts } from '../../services/productService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaShoppingCart, 
  FaSave, 
  FaUndo, 
  FaPlus, 
  FaTrashAlt, 
  FaTruck, 
  FaTag, 
  FaBoxOpen, 
  FaMoneyBillWave,
  FaCalculator
} from 'react-icons/fa';

const CreatePurchase = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    supplierId: '',
    categoryId: '',
    paymentMethod: 'Cash',
    remarks: '',
    purchaseDetails: [{ productId: '', quantity: 1, unitPrice: 0 }]
  });

  const [dependencies, setDependencies] = useState({
    suppliers: [],
    categories: [],
    products: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const canCreate = hasPermission('PURCHASE_CREATE');

  const fetchDependencies = useCallback(async () => {
    try {
      const [sups, cats, prods] = await Promise.all([
        getAllSuppliers({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllCategories({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllProducts({ pageNumber: 1, pageSize: 1000, status: true })
      ]);

      const normalize = (res, idKey, nameKey) => {
        if (!res.data || !res.data.isSuccess) return [];
        const items = res.data.data?.items || res.data.data || [];
        return items.map(i => ({
          id: i[idKey] || i.id || i.Id,
          name: i[nameKey] || i.name || i.Name
        }));
      };

      setDependencies({
        suppliers: normalize(sups, 'supplierID', 'supplierName'),
        categories: normalize(cats, 'categoryID', 'categoryName'),
        products: normalize(prods, 'productID', 'productName')
      });
    } catch (error) {
      console.error('Dependency sync failure:', error);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...formData.purchaseDetails];
    newDetails[index][name] = name === 'productId' ? value : parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
  };

  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      purchaseDetails: [...prev.purchaseDetails, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeDetailRow = (index) => {
    if (formData.purchaseDetails.length === 1) return;
    const newDetails = formData.purchaseDetails.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, purchaseDetails: newDetails }));
  };

  const calculateTotal = () => {
    return formData.purchaseDetails.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate) {
      toast.error('Access Denied: Cannot add.');
      return;
    }

    if (!formData.supplierId) {
      toast.error('Error: Please select a supplier.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        supplierId: parseInt(formData.supplierId),
        categoryId: parseInt(formData.categoryId) || null,
        totalAmount: calculateTotal(),
        purchaseDate: new Date().toISOString(),
        purchaseDetails: formData.purchaseDetails.map(d => ({
          ...d,
          productId: parseInt(d.productId),
          totalAmount: d.quantity * d.unitPrice
        }))
      };

      const response = await purchaseService.createPurchase(payload);
      if (response.data.isSuccess) {
        toast.success('Purchase added successfully.');
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        toast.error(response.data.message || 'Error: Purchase failed.');
      }
    } catch (error) {
      toast.error('Error: Could not save purchase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-1 max-w-6xl mx-auto text-left">
      <FormCard>
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
          <div className="p-3 bg-green-600 rounded-2xl shadow-lg shadow-green-100">
            <FaShoppingCart className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Add Purchase</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Create a new procurement record</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* HEADER INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-green-600">Supplier</label>
              <div className="relative">
                <FaTruck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500" />
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-100 transition-all font-bold text-gray-700 appearance-none"
                  required
                >
                  <option value="">Select Supplier</option>
                  {dependencies.suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-green-600">Category</label>
              <div className="relative">
                <FaTag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500" />
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-100 transition-all font-bold text-gray-700 appearance-none"
                >
                  <option value="">Select Category</option>
                  {dependencies.categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-green-600">Payment Method</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500" />
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-100 transition-all font-bold text-gray-700 appearance-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
            </div>
          </div>

          {/* ITEM TABLE */}
          <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FaBoxOpen className="text-green-500" /> Manifest Details
            </h3>
            
            <div className="space-y-4">
              {formData.purchaseDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end animate-fade-in">
                  <div className="md:col-span-5 relative group">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Product Name</label>
                    <select
                      name="productId"
                      value={detail.productId}
                      onChange={(e) => handleDetailChange(index, e)}
                      className="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl outline-none focus:border-green-100 transition-all font-bold text-gray-700 text-sm appearance-none"
                      required
                    >
                      <option value="">Select Product</option>
                      {dependencies.products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 relative group">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={detail.quantity}
                      onChange={(e) => handleDetailChange(index, e)}
                      className="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl outline-none focus:border-green-100 transition-all font-bold text-gray-700 text-sm"
                      min="1"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 relative group">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      name="unitPrice"
                      value={detail.unitPrice}
                      onChange={(e) => handleDetailChange(index, e)}
                      className="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl outline-none focus:border-green-100 transition-all font-bold text-gray-700 text-sm"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 relative group">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Subtotal</label>
                    <div className="px-5 py-3 bg-green-50 text-green-700 font-black rounded-xl text-sm border border-green-100">
                      ৳{(detail.quantity * detail.unitPrice).toLocaleString()}
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={() => removeDetailRow(index)}
                      className="p-3.5 bg-white text-red-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm border border-transparent hover:border-red-100"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addDetailRow}
              className="mt-8 flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md hover:scale-105 transition-all border border-green-50"
            >
              <FaPlus /> Add Line Item
            </button>
          </div>

          {/* SUMMARY & ACTIONS */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-gray-100">
            <div className="flex items-center gap-4 bg-gray-900 px-8 py-4 rounded-[2rem] shadow-xl">
              <div className="p-2 bg-green-500 rounded-lg">
                <FaCalculator className="text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Aggregate Total</p>
                <p className="text-2xl font-black text-white leading-tight">৳{calculateTotal().toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
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
                className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/20 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {isLoading ? 'Saving...' : 'Save Purchase'}
              </button>
            </div>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default CreatePurchase;
