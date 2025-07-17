import React, { useState, useEffect } from 'react';
import FormCard from '../../components/FormCard.jsx';

const PermissionAdd = ({ isEdit = false, permissionData = null, onClose, showTitle= true }) => {
  const [formData, setFormData] = useState({
    permissionName: '',
    permissionKey: '',
    controllerName: '',
    actionName: '',
    moduleName: '',
    status: true
  });

  useEffect(() => {
    if (isEdit && permissionData) {
      setFormData({
        permissionName: permissionData.permissionName || '',
        permissionKey: permissionData.permissionKey || '',
        controllerName: permissionData.controllerName || '',
        actionName: permissionData.actionName || '',
        moduleName: permissionData.moduleName || '',
        status: permissionData.status ?? true
      });
    }
  }, [isEdit, permissionData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    if (isEdit && permissionData) {
      setFormData({
        permissionName: permissionData.permissionName || '',
        permissionKey: permissionData.permissionKey || '',
        controllerName: permissionData.controllerName || '',
        actionName: permissionData.actionName || '',
        moduleName: permissionData.moduleName || '',
        status: permissionData.status ?? true
      });
    } else {
      setFormData({
        permissionName: '',
        permissionKey: '',
        controllerName: '',
        actionName: '',
        moduleName: '',
        status: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        PermissionName: formData.permissionName,
        PermissionKey: formData.permissionKey,
        ControllerName: formData.controllerName || null,
        ActionName: formData.actionName || null,
        ModuleName: formData.moduleName || null,
        ...(isEdit && { Status: formData.status })
      };

      console.log('Permission submitted:', payload);
      // TODO: Add API call to submit the data
      onClose();
    } catch (error) {
      console.error('Error submitting permission:', error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEdit ? 'Edit Permission' : 'Create New Permission'}
        </h2> */}
        {showTitle && !isEdit && (
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Permission</h2>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permission Key</label>
              <input
                type="text"
                name="permissionKey"
                value={formData.permissionKey}
                placeholder="Enter unique permission key"
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Controller Name</label>
              <input
                type="text"
                name="controllerName"
                value={formData.controllerName}
                placeholder="Optional - e.g., User"
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Name</label>
              <input
                type="text"
                name="actionName"
                value={formData.actionName}
                placeholder="Optional - e.g., Create"
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
              <input
                type="text"
                name="moduleName"
                value={formData.moduleName}
                placeholder="Optional - e.g., User Management"
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {isEdit && (
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status ? 'active' : 'inactive'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value === 'active' })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              {isEdit ? 'Update Permission' : 'Create Permission'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default PermissionAdd;
