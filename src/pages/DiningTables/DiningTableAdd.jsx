import React, { useState, useEffect } from 'react';
import { createDiningTable, updateDiningTable } from '../../services/diningTableService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaUtensils, 
  FaSave, 
  FaUndo, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTh,
  FaUsers
} from 'react-icons/fa';

const DiningTableAdd = ({ isEdit = false, tableData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    tableName: '',
    status: true,
    diningTableStatus: 'Available'
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = hasPermission('DINING_TABLE_CREATE');
  const canUpdate = hasPermission('DINING_TABLE_UPDATE');

  useEffect(() => {
    if (isEdit && tableData) {
      setFormData({
        tableID: tableData.tableID,
        tableName: tableData.tableName || '',
        status: tableData.status ?? true,
        diningTableStatus: tableData.diningTableStatus || 'Available'
      });
    }
  }, [isEdit, tableData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && tableData) {
      setFormData({
        tableID: tableData.tableID,
        tableName: tableData.tableName || '',
        status: tableData.status ?? true,
        diningTableStatus: tableData.diningTableStatus || 'Available'
      });
    } else {
      setFormData({
        tableName: '',
        status: true,
        diningTableStatus: 'Available'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (isEdit && !canUpdate) {
      toast.error('Access Denied: Cannot edit.');
      setIsLoading(false);
      return;
    }
    if (!isEdit && !canCreate) {
      toast.error('Access Denied: Cannot add.');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (isEdit) {
        // Assuming updateDiningTable exists in service
        response = await updateDiningTable(formData.tableID, formData);
      } else {
        response = await createDiningTable(formData);
      }

      if (response.data.isSuccess || response.data.succeeded) {
        toast.success(isEdit ? 'Table updated.' : 'Table added.');
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
          toast.error('Error: Invalid data.');
        } else {
          toast.error(errorResponse?.message || 'Server error.');
        }
      }
    } catch (error) {
      toast.error('Error: Could not load tables.');
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
              <FaUtensils className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Table' : 'Add Table'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Dining Table Management</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Table Name */}
            <div className="relative group md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Table Name
              </label>
              <div className="relative">
                <FaTh className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="tableName"
                  value={formData.tableName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.tablename || errors.tableName ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Table 01 - Main Floor"
                  required
                />
              </div>
              {(errors.tablename || errors.tableName) && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.tablename || errors.tableName}</p>
              )}
            </div>

            {/* Occupancy Status */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Occupancy Status
              </label>
              <div className="relative">
                <FaUsers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select
                  name="diningTableStatus"
                  value={formData.diningTableStatus}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer ${
                    errors.diningtablestatus || errors.diningTableStatus ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              {(errors.diningtablestatus || errors.diningTableStatus) && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.diningtablestatus || errors.diningTableStatus}</p>
              )}
            </div>

            {/* Operational Status */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Status
              </label>
              <div className={`flex gap-4 p-1 bg-gray-50 rounded-2xl border-2 transition-all ${
                errors.status ? 'border-red-100 focus-within:border-red-400' : 'border-transparent focus-within:border-blue-100 focus-within:bg-white'
              }`}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: true }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    formData.status ? 'bg-white text-green-600 shadow-sm border border-green-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaCheckCircle className={formData.status ? 'text-green-500' : 'text-gray-300'} /> Online
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: false }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    !formData.status ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FaTimesCircle className={!formData.status ? 'text-red-500' : 'text-gray-300'} /> Maintenance
                </button>
              </div>
              {errors.status && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.status}</p>
              )}
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
              <FaSave /> {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Table'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default DiningTableAdd;
