import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { createPermission, updatePermission } from '../../services/permissionService.js';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaShieldAlt, 
  FaSave, 
  FaUndo, 
  FaKey,
  FaFingerprint,
  FaCubes,
  FaLayerGroup
} from 'react-icons/fa';

const PermissionAdd = ({ isEdit = false, permissionData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    permissionName: '',
    permissionKey: '',
    controllerName: '',
    actionName: '',
    moduleName: '',
  });
  const [errors, setErrors] = useState({});

  const canCreatePermission = hasPermission('PERMISSION_CREATE');
  const canUpdatePermission = hasPermission('PERMISSION_UPDATE');

  useEffect(() => {
    if (isEdit && permissionData) {
      setFormData({
        id: permissionData.id,
        permissionName: permissionData.permissionName || '',
        permissionKey: permissionData.permissionKey || '',
        controllerName: permissionData.controllerName || '',
        actionName: permissionData.actionName || '',
        moduleName: permissionData.moduleName || '',
      });
    }
  }, [isEdit, permissionData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && permissionData) {
      setFormData({
        id: permissionData.id,
        permissionName: permissionData.permissionName || '',
        permissionKey: permissionData.permissionKey || '',
        controllerName: permissionData.controllerName || '',
        actionName: permissionData.actionName || '',
        moduleName: permissionData.moduleName || '',
      });
    } else {
      setFormData({
        permissionName: '',
        permissionKey: '',
        controllerName: '',
        actionName: '',
        moduleName: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (isEdit && !canUpdatePermission) {
      toast.error('Identity Authorization: Update denied.');
      return;
    }
    if (!isEdit && !canCreatePermission) {
      toast.error('Identity Authorization: Creation denied.');
      return;
    }

    // Basic Validation
    if (!formData.permissionName || !formData.permissionKey) {
      toast.error('Protocol validation failed: Required fields missing.');
      return;
    }

    try {
      let response;
      if (isEdit) {
        response = await updatePermission(formData.id, formData);
      } else {
        response = await createPermission(formData);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Permission updated.' : 'Permission saved.');
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
          toast.error('Constraint violation: Permission rejected.');
        } else {
          toast.error(errorResponse?.message || 'Server-side protocol error.');
        }
      }
    } catch (error) {
      toast.error('Critical failure: Permission registry unreachable.');
      console.error('Permission operation error:', error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto text-left">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Permission' : 'Add Permission'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">System Access Management</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Permission Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Permission Name
              </label>
              <div className="relative">
                <FaKey className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="permissionName"
                  value={formData.permissionName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.permissionname ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. View Orders"
                  required
                />
              </div>
              {errors.permissionname && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 ml-1">{errors.permissionname}</p>}
            </div>

            {/* Permission Key */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Permission Key
              </label>
              <div className="relative">
                <FaFingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="permissionKey"
                  value={formData.permissionKey}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.permissionkey ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. ORDER_VIEW"
                  required
                />
              </div>
              {errors.permissionkey && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 ml-1">{errors.permissionkey}</p>}
            </div>

            {/* Controller Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Module Name
              </label>
              <div className="relative">
                <FaCubes className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="controllerName"
                  value={formData.controllerName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.controllername ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Orders"
                />
              </div>
            </div>

            {/* Action Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Action Name
              </label>
              <div className="relative">
                <FaSave className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="actionName"
                  value={formData.actionName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.actionname ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. GetAll"
                />
              </div>
            </div>

            {/* Module Name */}
            <div className="md:col-span-2 relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Category / Group
              </label>
              <div className="relative">
                <FaLayerGroup className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="moduleName"
                  value={formData.moduleName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.modulename ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Management"
                />
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
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <FaSave /> {isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default PermissionAdd;