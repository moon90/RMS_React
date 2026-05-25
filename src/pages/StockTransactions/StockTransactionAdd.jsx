import React, { useState, useEffect, useCallback } from 'react';
import { createStockTransaction, updateStockTransaction } from '../../services/stockTransactionService';
import { getAllProducts } from '../../services/productService';
import { getAllSuppliers } from '../../services/supplierService';
import { salesService } from '../../services/salesService';
import { purchaseService } from '../../services/purchaseService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaExchangeAlt, 
  FaSave, 
  FaUndo, 
  FaBoxOpen, 
  FaTruck, 
  FaCalendarAlt, 
  FaClipboardList,
  FaFileInvoice,
  FaCogs,
  FaHistory
} from 'react-icons/fa';

const StockTransactionAdd = ({ isEdit, transactionData, onSave, onClose, showTitle = true }) => {
  const [formData, setFormData] = useState({
    productID: '',
    supplierID: '',
    transactionType: 'IN',
    quantity: '',
    remarks: '',
    transactionDate: new Date().toISOString().slice(0, 10),
    expireDate: '',
    saleID: '',
    purchaseID: '',
    transactionSource: '',
    adjustmentType: '',
    reason: '',
    ingredientID: ''
  });

  const [dependencies, setDependencies] = useState({
    products: [],
    suppliers: [],
    ingredients: [],
    sales: [],
    purchases: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const canModify = isEdit ? hasPermission('STOCK_TRANSACTION_UPDATE') : hasPermission('STOCK_TRANSACTION_CREATE');

  const fetchDependencies = useCallback(async () => {
    try {
      const [productsRes, suppliersRes, ingredientsRes, salesRes, purchasesRes] = await Promise.all([
        getAllProducts({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllSuppliers({ pageNumber: 1, pageSize: 1000, status: true }),
        import('../../services/ingredientService').then(m => m.getAllIngredients({ pageNumber: 1, pageSize: 1000, status: true })),
        salesService.getAllSales({ pageNumber: 1, pageSize: 1000 }),
        purchaseService.getAllPurchases({ pageNumber: 1, pageSize: 1000 })
      ]);

      const normalize = (res, idKey, nameKey) => {
        if (!res.data || !res.data.isSuccess) return [];
        const items = res.data.data?.items || res.data.data || [];
        return items.map(i => ({
          id: i[idKey] || i.id || i.Id,
          name: i[nameKey] || i.name || i.Name || `ID: ${i[idKey] || i.id || i.Id}`
        }));
      };

      setDependencies({
        products: normalize(productsRes, 'productID', 'productName'),
        suppliers: normalize(suppliersRes, 'supplierID', 'supplierName'),
        ingredients: normalize(ingredientsRes, 'ingredientID', 'ingredientName'),
        sales: normalize(salesRes, 'saleID', 'saleDate'),
        purchases: normalize(purchasesRes, 'purchaseID', 'purchaseDate')
      });
    } catch (error) {
      console.error('Dependency sync failure:', error);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
    if (isEdit && transactionData) {
      setFormData({
        ...transactionData,
        transactionDate: transactionData.transactionDate ? transactionData.transactionDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        expireDate: transactionData.expireDate ? transactionData.expireDate.slice(0, 10) : '',
        productID: transactionData.productID || '',
        supplierID: transactionData.supplierID || '',
        ingredientID: transactionData.ingredientID || '',
        saleID: transactionData.saleID || '',
        purchaseID: transactionData.purchaseID || '',
        adjustmentType: transactionData.adjustmentType || '',
        reason: transactionData.reason || ''
      });
    }
  }, [isEdit, transactionData, fetchDependencies]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
      // Ensure quantity is a valid number to prevent NaN/400 errors
      const qty = parseInt(formData.quantity);
      if (isNaN(qty)) {
          toast.error('Magnitude validation: Quantity must be a numeric value.');
          setIsLoading(false);
          return;
      }

      const payload = {
        ...formData,
        productID: formData.productID ? parseInt(formData.productID) : null,
        supplierID: formData.supplierID ? parseInt(formData.supplierID) : null,
        ingredientID: formData.ingredientID ? parseInt(formData.ingredientID) : null,
        quantity: qty,
        saleID: formData.saleID ? parseInt(formData.saleID) : null,
        purchaseID: formData.purchaseID ? parseInt(formData.purchaseID) : null,
        adjustmentType: formData.transactionType === 'ADJUSTMENT' ? formData.adjustmentType : null,
        reason: formData.transactionType === 'ADJUSTMENT' ? formData.reason : null,
      };

      // Validation: Either Product or Ingredient must be linked
      if (!payload.productID && !payload.ingredientID) {
          toast.error('Registry Error: Movement must be linked to a Product or Ingredient Node.');
          setIsLoading(false);
          return;
      }

      const response = isEdit 
        ? await updateStockTransaction(formData.transactionID, payload)
        : await createStockTransaction(payload);

      if (response.data && response.data.isSuccess) {
        toast.success(isEdit ? 'Movement updated.' : 'Movement saved.');
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        toast.error(response.data.message || 'System rejection: Operation failed.');
      }
    } catch (error) {
      if (error.response?.data?.details) {
        const newErrors = {};
        error.response.data.details.forEach(err => {
          newErrors[err.propertyName.toLowerCase()] = err.errorMessage;
        });
        setErrors(newErrors);
        toast.error('Validation failure: Review registry entries.');
      } else {
        toast.error('Critical failure: Stock registry unreachable.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-1 ${showTitle ? 'max-w-4xl mx-auto' : ''}`}>
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaExchangeAlt className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Movement' : 'Add Movement'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Adjust stock levels</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Core Details */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Product Node</label>
              <div className="relative">
                <FaBoxOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="productID"
                  value={formData.productID}
                  onChange={handleChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 ${errors.productid ? 'border-red-400' : 'border-transparent'} rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-900 appearance-none`}
                  required
                >
                  <option value="" className="text-gray-900 bg-white">Select Product</option>
                  {dependencies.products.map(p => <option key={p.id} value={p.id} className="text-gray-900 bg-white">{p.name}</option>)}
                </select>
              </div>
              {errors.productid && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.productid}</p>}
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Ingredient Node</label>
              <div className="relative">
                <FaBoxOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="ingredientID"
                  value={formData.ingredientID}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-900 appearance-none"
                >
                  <option value="" className="text-gray-900 bg-white">Select Ingredient (Optional)</option>
                  {dependencies.ingredients.map(i => <option key={i.id} value={i.id} className="text-gray-900 bg-white">{i.name}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Supplier Authority</label>
              <div className="relative">
                <FaTruck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="supplierID"
                  value={formData.supplierID}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-900 appearance-none"
                >
                  <option value="" className="text-gray-900 bg-white">Select Supplier (Optional)</option>
                  {dependencies.suppliers.map(s => <option key={s.id} value={s.id} className="text-gray-900 bg-white">{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Movement Type</label>
              <div className="relative">
                <FaExchangeAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-900 appearance-none"
                  required
                >
                  <option value="IN" className="text-gray-900 bg-white">IN (Stock Entry)</option>
                  <option value="OUT" className="text-gray-900 bg-white">OUT (Stock Removal)</option>
                  <option value="ADJUSTMENT" className="text-gray-900 bg-white">ADJUSTMENT (Correction)</option>
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Quantity Magnitude</label>
              <div className="relative">
                <FaHistory className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 ${errors.quantity ? 'border-red-400' : 'border-transparent'} rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700`}
                  required
                />
              </div>
              {errors.quantity && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.quantity}</p>}
            </div>

            {/* Dates */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Transaction Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <input
                  type="date"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Expiry Threshold</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <input
                  type="date"
                  name="expireDate"
                  value={formData.expireDate}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                />
              </div>
            </div>

            {/* Reference IDs */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Sales Reference (Optional)</label>
              <div className="relative">
                <FaFileInvoice className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="saleID"
                  value={formData.saleID}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-900 appearance-none"
                >
                  <option value="" className="text-gray-900 bg-white">None / Manual</option>
                  {dependencies.sales.map(s => (
                    <option key={s.id} value={s.id} className="text-gray-900 bg-white">
                      Sale #{s.id} ({new Date(s.name).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Purchase Reference (Optional)</label>
              <div className="relative">
                <FaFileInvoice className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                <select
                  name="purchaseID"
                  value={formData.purchaseID}
                  onChange={handleChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-900 appearance-none"
                >
                  <option value="" className="text-gray-900 bg-white">None / Manual</option>
                  {dependencies.purchases.map(p => (
                    <option key={p.id} value={p.id} className="text-gray-900 bg-white">
                      Purchase #{p.id} ({new Date(p.name).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Adjustment Specifics */}
            {formData.transactionType === 'ADJUSTMENT' && (
              <>
                <div className="relative group md:col-span-1 animate-fade-in">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Adjustment Vector</label>
                  <div className="relative">
                    <FaCogs className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500" />
                    <select
                      name="adjustmentType"
                      value={formData.adjustmentType}
                      onChange={handleChange}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-900 appearance-none"
                      required
                    >
                      <option value="" className="text-gray-900 bg-white">Select Direction</option>
                      <option value="Addition" className="text-gray-900 bg-white">Addition (+)</option>
                      <option value="Subtraction" className="text-gray-900 bg-white">Subtraction (-)</option>
                    </select>
                  </div>
                </div>
                <div className="relative group md:col-span-1 animate-fade-in">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Adjustment Rationale</label>
                  <div className="relative">
                    <FaClipboardList className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500" />
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Specify cause for adjustment..."
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 min-h-[58px] max-h-[150px]"
                      required
                    ></textarea>
                  </div>
                </div>
              </>
            )}

            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600">Transaction Source & Remarks</label>
              <div className="relative">
                <FaClipboardList className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500" />
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Additional contextual information..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 min-h-[100px]"
                ></textarea>
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

export default StockTransactionAdd;