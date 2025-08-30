import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { createPermission, updatePermission } from '../../services/permissionService.js';
import { hasPermission } from '../../utils/permissionUtils';

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
      toast.error('You do not have permission to update permissions.');
      return;
    }
    if (!isEdit && !canCreatePermission) {
      toast.error('You do not have permission to create permissions.');
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
        toast.success(isEdit ? 'Permission updated successfully!' : 'Permission created successfully!');
        onSave();
        if (onClose) onClose();
      } else {
        const errorResponse = response.data;
        if (errorResponse && errorResponse.details && errorResponse.details.length > 0) {
          const newErrors = {};
          let toastMessage = "Validation failed:\n";
          errorResponse.details.forEach(err => {
            newErrors[err.propertyName] = err.errorMessage;
            toastMessage += `- ${err.errorMessage}\n`;
          });
          setErrors(newErrors);
          toast.error(toastMessage);
        } else {
          toast.error(errorResponse?.message || `An error occurred while ${isEdit ? 'updating' : 'creating'} the permission.`);
        }
      }
    } catch (error) {
      toast.error(`An error occurred while ${isEdit ? 'updating' : 'creating'} the permission.`);
      console.error('Permission operation error:', error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        {showTitle && (
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isEdit ? 'Edit Permission' : 'Create New Permission'}
          </h2>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission Name</label>
              <input
                type="text"
                name="permissionName"
                value={formData.permissionName}
                placeholder="Enter permission name"
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 border ${errors.permissionName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.permissionName && <p className="text-red-500 text-xs mt-1">{errors.permissionName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission Key</label>
              <input
                type="text"
                name="permissionKey"
                value={formData.permissionKey}
                placeholder="Enter permission key (e.g., USER_CREATE)"
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 border ${errors.permissionKey ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.permissionKey && <p className="text-red-500 text-xs mt-1">{errors.permissionKey}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Controller Name (Optional)</label>
              <input
                type="text"
                name="controllerName"
                value={formData.controllerName}
                placeholder="e.g., UsersController"
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.controllerName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.controllerName && <p className="text-red-500 text-xs mt-1">{errors.controllerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Name (Optional)</label>
              <input
                type="text"
                name="actionName"
                value={formData.actionName}
                placeholder="e.g., CreateUser"
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.actionName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.actionName && <p className="text-red-500 text-xs mt-1">{errors.actionName}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Name (Optional)</label>
              <input
                type="text"
                name="moduleName"
                value={formData.moduleName}
                placeholder="e.g., User Management"
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.moduleName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.moduleName && <p className="text-red-500 text-xs mt-1">{errors.moduleName}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                handleReset();
                if(onClose) onClose();
              }}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Reset
            </button>

            {(isEdit && canUpdatePermission || !isEdit && canCreatePermission) && (
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
              >
                {isEdit ? 'Update Permission' : 'Create Permission'}
              </button>
            )}
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default PermissionAdd;