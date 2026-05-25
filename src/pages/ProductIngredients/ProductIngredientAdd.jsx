import React, { useState, useEffect, useCallback } from 'react';
import { createProductIngredient, updateProductIngredient, deleteProductIngredient } from '../../services/productIngredientService';
import { getAllProducts } from '../../services/productService';
import { getAllIngredients } from '../../services/ingredientService';
import { getAllUnits } from '../../services/unitService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaFlask, 
  FaSave, 
  FaUndo, 
  FaBoxOpen, 
  FaLeaf, 
  FaWeightHanging, 
  FaPlus, 
  FaTrashAlt,
  FaBalanceScale,
  FaClipboardList,
  FaCheckCircle
} from 'react-icons/fa';

const ProductIngredientAdd = ({ isEdit, data, onSave, onClose, showTitle = true }) => {
  const [productID, setProductID] = useState('');
  const [rows, setRows] = useState([
    { id: Date.now(), ingredientID: '', quantity: '', unitID: '', remarks: '', isExisting: false }
  ]);

  const [dependencies, setDependencies] = useState({
    products: [],
    ingredients: [],
    units: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const canModify = isEdit ? hasPermission('PRODUCT_INGREDIENT_UPDATE') : hasPermission('PRODUCT_INGREDIENT_CREATE');

  const fetchDependencies = useCallback(async () => {
    try {
      const [productsRes, ingredientsRes, unitsRes] = await Promise.all([
        getAllProducts({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllIngredients({ pageNumber: 1, pageSize: 1000, status: true }),
        getAllUnits({ pageNumber: 1, pageSize: 1000, status: true }),
      ]);

      const normalize = (res, idKey, nameKey) => {
        if (!res.data || !res.data.isSuccess) return [];
        const data = res.data.data;
        const items = data?.items || data?.Items || (Array.isArray(data) ? data : []);
        
        return items.map(i => {
          const id = i[idKey] || i.id || i.Id || i.productID || i.ingredientID || i.unitID;
          const name = i[nameKey] || i.name || i.Name || i.productName || i.ingredientName || i.unitName || i.shortCode;
          return { ...i, id, name, productName: name, ingredientName: name }; // Keep original + common aliases
        });
      };

      setDependencies({
        products: normalize(productsRes, 'productID', 'productName'),
        ingredients: normalize(ingredientsRes, 'ingredientID', 'name'),
        units: normalize(unitsRes, 'id', 'name'),
      });
    } catch (error) {
      console.error('Dependency sync failure:', error);
      toast.error('System failed to sync material registries.');
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
    if (data && data.productID) {
      setProductID(data.productID);
      // If editing a specific mapping, or just entering from a product context
      if (isEdit && data.productIngredientID) {
        setRows([{
          id: data.productIngredientID,
          productIngredientID: data.productIngredientID,
          ingredientID: data.ingredientID || '',
          quantity: data.quantity || '',
          unitID: data.unitID || '',
          remarks: data.remarks || '',
          isExisting: true
        }]);
      }
    }
  }, [isEdit, data, fetchDependencies]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), ingredientID: '', quantity: '', unitID: '', remarks: '', isExisting: false }]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  const handleRowChange = (id, field, value) => {
    const updatedRows = rows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canModify) {
      toast.error('Authorization Denied.');
      return;
    }

    if (!productID) {
      toast.error('Please select a Target Product.');
      return;
    }

    // Validation for unique ingredients
    const selectedIngredients = rows.map(r => r.ingredientID).filter(id => id !== '');
    const uniqueIngredients = new Set(selectedIngredients);
    if (selectedIngredients.length !== uniqueIngredients.size) {
      toast.error('Duplicate ingredients detected. Each component must be unique.');
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let failMessages = [];

    try {
      const activeRows = rows.filter(row => row.ingredientID && row.quantity && row.unitID);
      
      if (activeRows.length === 0) {
        toast.warn('Protocol empty. No components defined.');
        setIsLoading(false);
        return;
      }

      for (const row of activeRows) {
        const payload = {
          productID: parseInt(productID),
          ingredientID: parseInt(row.ingredientID),
          quantity: parseFloat(row.quantity),
          unitID: parseInt(row.unitID),
          remarks: row.remarks || '',
          productIngredientID: row.productIngredientID || 0,
          status: true
        };

        try {
          const response = row.isExisting 
            ? await updateProductIngredient(row.productIngredientID, payload)
            : await createProductIngredient(payload);
          
          if (response.data.isSuccess) successCount++;
          else failMessages.push(response.data.message || `Component ${row.id} failed.`);
        } catch (err) {
          failMessages.push(err.response?.data?.message || `Network error for component ${row.id}.`);
        }
      }

      if (successCount > 0) {
        toast.success(`Protocol Synchronized: ${successCount} components saved.`);
      }
      
      if (failMessages.length > 0) {
        failMessages.forEach(msg => toast.error(msg));
      }

      if (successCount > 0) {
        if (onSave) onSave();
        if (onClose) onClose();
      }
    } catch (error) {
      toast.error('Critical failure: Protocol save interrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-1 ${showTitle ? 'max-w-6xl mx-auto' : ''} text-left`}>
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-100">
              <FaFlask className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Add Ingredients</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manage ingredients for products</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* PRODUCT SELECTION */}
          <div className="bg-gray-50 p-8 rounded-[2rem] border-2 border-gray-100/50">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-4 block">Select Product</label>
            <div className="relative group max-w-xl">
              <FaBoxOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-purple-500 transition-colors" />
                <select
                  value={productID}
                  onChange={(e) => setProductID(e.target.value)}
                  disabled={isEdit}
                  className="w-full pl-16 pr-8 py-5 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-purple-200 transition-all font-black text-gray-700 appearance-none shadow-sm disabled:opacity-50"
                  required
                >
                  <option value="">Select Target Product</option>
                  {dependencies.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
          </div>

          {/* INGREDIENTS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FaLeaf className="text-purple-400" />
                Ingredients
              </h3>
              <button 
                type="button" 
                onClick={addRow}
                className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-100 transition-all border border-purple-100"
              >
                <FaPlus /> Add Row
              </button>
            </div>

            <div className="overflow-x-auto rounded-[2rem] border border-gray-100 shadow-sm">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Ingredient</th>
                    <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                    <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Unit</th>
                    <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Remarks</th>
                    <th className="px-6 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-4 py-4 min-w-[200px]">
                        <select
                          value={row.ingredientID}
                          onChange={(e) => handleRowChange(row.id, 'ingredientID', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-purple-100 transition-all font-bold text-gray-700 text-sm appearance-none"
                          required
                        >
                          <option value="">Select Ingredient</option>
                          {dependencies.ingredients
                            .filter(i => !rows.find(r => r.id !== row.id && r.ingredientID === i.id.toString()))
                            .map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4 w-[120px]">
                        <input
                          type="number"
                          step="0.001"
                          value={row.quantity}
                          onChange={(e) => handleRowChange(row.id, 'quantity', e.target.value)}
                          placeholder="0.000"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-purple-100 transition-all font-bold text-gray-700 text-sm"
                          required
                        />
                      </td>
                      <td className="px-4 py-4 w-[150px]">
                        <select
                          value={row.unitID}
                          onChange={(e) => handleRowChange(row.id, 'unitID', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-purple-100 transition-all font-bold text-gray-700 text-sm appearance-none"
                          required
                        >
                          <option value="">Unit</option>
                          {dependencies.units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={row.remarks}
                          onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)}
                          placeholder="Context..."
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-purple-100 transition-all font-bold text-gray-700 text-sm"
                        />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          type="button" 
                          onClick={() => removeRow(row.id)}
                          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-10 border-t border-gray-100">
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
              className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:bg-purple-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> {isEdit ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default ProductIngredientAdd;