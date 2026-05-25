import React, { useState, useEffect } from 'react';
import { createInventory, updateInventory } from '../../services/inventoryService';
import { getAllProducts } from '../../services/productService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaWarehouse, 
  FaSave, 
  FaUndo, 
  FaCheckCircle, 
  FaTimesCircle,
  FaBoxOpen,
  FaChartLine,
  FaShoppingCart,
  FaBoxes
} from 'react-icons/fa';

const InventoryAdd = ({ isEdit = false, inventoryData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    productID: '',
    initialStock: '',
    currentStock: '',
    minStockLevel: '',
    status: true
  });
  
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('INVENTORY_CREATE');
  const canUpdate = hasPermission('INVENTORY_UPDATE');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const productsRes = await getAllProducts({ pageNumber: 1, pageSize: 1000, status: true });
        if (productsRes.data.isSuccess) {
          const data = productsRes.data.data;
          const items = data?.items || data?.Items || (Array.isArray(data) ? data : []);
          setProducts(items.map(p => ({
            id: p.id || p.Id || p.productID,
            name: p.productName || p.name || p.Name
          })));
        }
      } catch (error) {
        toast.error('Dependency synchronization failed.');
      }
    };
    fetchDependencies();
  }, []);

  useEffect(() => {
    if (isEdit && inventoryData) {
      setFormData({
        inventoryID: inventoryData.inventoryID || inventoryData.id,
        productID: inventoryData.productID || '',
        initialStock: inventoryData.initialStock || '',
        currentStock: inventoryData.currentStock || '',
        minStockLevel: inventoryData.minStockLevel || '',
        status: inventoryData.status ?? true
      });
    }
  }, [isEdit, inventoryData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && inventoryData) {
      setFormData({
        inventoryID: inventoryData.inventoryID || inventoryData.id,
        productID: inventoryData.productID || '',
        initialStock: inventoryData.initialStock || '',
        currentStock: inventoryData.currentStock || '',
        minStockLevel: inventoryData.minStockLevel || '',
        status: inventoryData.status ?? true
      });
    } else {
      setFormData({
        productID: '',
        initialStock: '',
        currentStock: '',
        minStockLevel: '',
        status: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (isEdit && !canUpdate) {
      toast.error('Access denied');
      setIsLoading(false);
      return;
    }
    if (!isEdit && !canCreate) {
      toast.error('Access denied');
      setIsLoading(false);
      return;
    }

    const payload = {
      ...formData,
      productID: parseInt(formData.productID),
      initialStock: parseInt(formData.initialStock),
      currentStock: parseInt(formData.currentStock),
      minStockLevel: parseInt(formData.minStockLevel)
    };

    try {
      let response;
      if (isEdit) {
        response = await updateInventory(payload.inventoryID, payload);
      } else {
        response = await createInventory(payload);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Stock updated' : 'Stock saved');
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        const errorResponse = response.data;
        if (errorResponse && errorResponse.details && errorResponse.details.length > 0) {
          const apiErrors = {};
          errorResponse.details.forEach(err => {
            apiErrors[err.propertyName.toLowerCase()] = err.errorMessage;
          });
          setErrors(apiErrors);
          toast.error('Save failed');
        } else {
          toast.error(errorResponse?.message || 'Error occurred');
        }
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto text-left">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaWarehouse className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Stock' : 'Add Stock'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1 text-left">Stock details</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Selection */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Product
              </label>
              <div className="relative">
                <FaBoxOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  name="productID"
                  value={formData.productID}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 appearance-none cursor-pointer disabled:opacity-50"
                  required
                  disabled={isEdit}
                >
                  <option value="">Select Product</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stocks */}
            <div className="relative group text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Initial Stock
              </label>
              <div className="relative">
                <FaBoxes className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="number"
                  name="initialStock"
                  value={formData.initialStock}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="relative group text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                {isEdit ? 'Current Stock Adjustment' : 'Min Stock Level'}
              </label>
              <div className="relative">
                {isEdit ? (
                   <>
                    <FaChartLine className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="number"
                      name="currentStock"
                      value={formData.currentStock}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                      placeholder="0"
                      required
                    />
                   </>
                ) : (
                  <>
                    <FaShoppingCart className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="number"
                      name="minStockLevel"
                      value={formData.minStockLevel}
                      onChange={handleInputChange}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                      placeholder="0"
                      required
                    />
                  </>
                )}
              </div>
            </div>

            {isEdit && (
               <div className="relative group text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                  Min Stock Level
                </label>
                <div className="relative">
                  <FaShoppingCart className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="number"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleInputChange}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            )}

            {/* Status */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors text-left">
                Status
              </label>
              <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: true }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    formData.status ? 'bg-white text-green-600 shadow-sm border border-green-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaCheckCircle className={formData.status ? 'text-green-500' : 'text-gray-300'} /> Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: false }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    !formData.status ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaTimesCircle className={!formData.status ? 'text-red-500' : 'text-gray-300'} /> Inactive
                </button>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => { handleReset(); if(onClose) onClose(); }}
              className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-600 transition-all flex items-center gap-2"
            >
              <FaUndo /> Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <FaSave /> {isEdit ? 'Update Stock' : 'Add Stock'}
                </>
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default InventoryAdd;