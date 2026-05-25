import React, { useState, useEffect } from 'react';
import { createIngredient, updateIngredient, getIngredientById } from '../../services/ingredientService';
import { getAllUnits } from '../../services/unitService';
import { getAllSuppliers } from '../../services/supplierService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaCarrot, 
  FaSave, 
  FaUndo, 
  FaCheckCircle, 
  FaTimesCircle,
  FaBalanceScale,
  FaUserTag,
  FaCalendarAlt,
  FaBoxes,
  FaStickyNote
} from 'react-icons/fa';

const IngredientAdd = ({ isEdit = false, ingredientData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantityAvailable: '',
    unitID: '',
    reorderLevel: '',
    reorderQuantity: '',
    supplierID: '',
    expireDate: '',
    remarks: '',
    status: true
  });
  
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('INGREDIENT_CREATE');
  const canUpdate = hasPermission('INGREDIENT_UPDATE');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [unitsRes, suppliersRes] = await Promise.all([
          getAllUnits({ pageNumber: 1, pageSize: 1000, status: true }),
          getAllSuppliers({ pageNumber: 1, pageSize: 1000, status: true }),
        ]);

        const normalize = (res, nameKey) => {
          if (!res.data || !res.data.isSuccess) return [];
          const data = res.data.data;
          const items = data?.items || data?.Items || (Array.isArray(data) ? data : []);
          return items.map(i => ({
            id: i.id || i.Id || i.unitID || i.supplierID || i.ingredientID,
            name: i[nameKey] || i.name || i.Name || i.supplierName || i.unitName
          }));
        };

        setUnits(normalize(unitsRes, 'name'));
        setSuppliers(normalize(suppliersRes, 'supplierName'));
      } catch (error) {
        toast.error('Dependency synchronization failed.');
      }
    };
    fetchDependencies();
  }, []);

  useEffect(() => {
    if (isEdit && ingredientData) {
      setFormData({
        ingredientID: ingredientData.ingredientID || ingredientData.id,
        name: ingredientData.name || '',
        quantityAvailable: ingredientData.quantityAvailable || '',
        unitID: ingredientData.unitID || '',
        reorderLevel: ingredientData.reorderLevel || '',
        reorderQuantity: ingredientData.reorderQuantity || '',
        supplierID: ingredientData.supplierID || '',
        expireDate: ingredientData.expireDate ? ingredientData.expireDate.split('T')[0] : '',
        remarks: ingredientData.remarks || '',
        status: ingredientData.status ?? true
      });
    }
  }, [isEdit, ingredientData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && ingredientData) {
      setFormData({
        ingredientID: ingredientData.ingredientID || ingredientData.id,
        name: ingredientData.name || '',
        quantityAvailable: ingredientData.quantityAvailable || '',
        unitID: ingredientData.unitID || '',
        reorderLevel: ingredientData.reorderLevel || '',
        reorderQuantity: ingredientData.reorderQuantity || '',
        supplierID: ingredientData.supplierID || '',
        expireDate: ingredientData.expireDate ? ingredientData.expireDate.split('T')[0] : '',
        remarks: ingredientData.remarks || '',
        status: ingredientData.status ?? true
      });
    } else {
      setFormData({
        name: '',
        quantityAvailable: '',
        unitID: '',
        reorderLevel: '',
        reorderQuantity: '',
        supplierID: '',
        expireDate: '',
        remarks: '',
        status: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (isEdit && !canUpdate) {
      toast.error('Identity Authorization: Update denied.');
      setIsLoading(false);
      return;
    }
    if (!isEdit && !canCreate) {
      toast.error('Identity Authorization: Creation denied.');
      setIsLoading(false);
      return;
    }

    const payload = {
      ...formData,
      quantityAvailable: parseFloat(formData.quantityAvailable),
      unitID: parseInt(formData.unitID),
      reorderLevel: parseFloat(formData.reorderLevel),
      reorderQuantity: parseFloat(formData.reorderQuantity),
      supplierID: formData.supplierID ? parseInt(formData.supplierID) : null,
      expireDate: formData.expireDate ? new Date(formData.expireDate).toISOString() : null
    };

    try {
      let response;
      if (isEdit) {
        response = await updateIngredient(payload.ingredientID, payload);
      } else {
        response = await createIngredient(payload);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Ingredient edited.' : 'New ingredient added.');
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
          toast.error('Constraint violation: List rejected.');
        } else {
          toast.error(errorResponse?.message || 'Server-side protocol error.');
        }
      }
    } catch (error) {
      toast.error('Critical failure: Inventory List unreachable.');
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
              <FaCarrot className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Ingredient' : 'Add Ingredient'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Global Inventory List</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredient Name */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Ingredient Name
              </label>
              <div className="relative">
                <FaCarrot className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.name ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Organic Flour"
                  required
                />
              </div>
            </div>

            {/* Quantity & Unit */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Stock Quantity
              </label>
              <div className="relative">
                <FaBoxes className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="number"
                  step="0.01"
                  name="quantityAvailable"
                  value={formData.quantityAvailable}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.quantityavailable ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Measurement Standard
              </label>
              <div className="relative">
                <FaBalanceScale className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  name="unitID"
                  value={formData.unitID}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Unit</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reorder Level & Quantity */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Critical Threshold (Reorder Level)
              </label>
              <input
                type="number"
                step="0.01"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                placeholder="0.00"
                required
              />
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Supply Buffer (Reorder Quantity)
              </label>
              <input
                type="number"
                step="0.01"
                name="reorderQuantity"
                value={formData.reorderQuantity}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                placeholder="0.00"
                required
              />
            </div>

            {/* Supplier & Expire Date */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Primary Supply Partner
              </label>
              <div className="relative">
                <FaUserTag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  name="supplierID"
                  value={formData.supplierID}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Expiration Protocol
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  name="expireDate"
                  value={formData.expireDate}
                  onChange={handleInputChange}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700"
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2 relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Audit Remarks
              </label>
              <div className="relative">
                <FaStickyNote className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 resize-none"
                  placeholder="Enter any additional inventory context..."
                />
              </div>
            </div>

            {/* Status */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
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
              <FaUndo /> Reset Protocol
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {isLoading ? 'Updating...' : isEdit ? 'Save Changes' : 'Add Ingredient'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default IngredientAdd;