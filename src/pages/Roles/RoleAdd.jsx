import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { createRole, updateRole } from '../../services/roleService.js';

const RoleAdd = ({ isEdit = false, roleData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    status: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && roleData) {
      setFormData({
        roleID: roleData.roleID,
        roleName: roleData.roleName || '',
        description: roleData.description || '',
        status: roleData.status ?? true
      });
    }
  }, [isEdit, roleData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && roleData) {
      setFormData({
        roleID: roleData.roleID,
        roleName: roleData.roleName || '',
        description: roleData.description || '',
        status: roleData.status ?? true
      });
    } else {
      setFormData({
        roleName: '',
        description: '',
        status: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const rolePayload = { ...formData, Status: formData.status };

    try {
      if (isEdit) {
        const response = await updateRole(formData.roleID, rolePayload);
        if (!response.data.isSuccess) {
          throw { response };
        }
      } else {
        const response = await createRole(rolePayload);
        if (!response.data.isSuccess) {
          throw { response };
        }
      }

      toast.success(isEdit ? 'Role updated successfully' : 'Role created successfully');
      onSave();
      if (onClose) onClose();

    } catch (error) {
      const errorResponse = error.response?.data;
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
        toast.error(errorResponse?.message || `An error occurred while ${isEdit ? 'updating' : 'creating'} the role.`);
      }
      console.error(error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        {showTitle && (
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isEdit ? 'Edit Role' : 'Create New Role'}
          </h2>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                name="roleName"
                value={formData.roleName}
                placeholder="Enter role name"
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 border ${errors.roleName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.roleName && <p className="text-red-500 text-xs mt-1">{errors.roleName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                placeholder="Enter description"
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value === 'active',
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

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

            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              {isEdit ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default RoleAdd;