import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { createRole, updateRole } from '../../services/userRoleManagementService.js';
import { hasPermission } from '../../utils/permissionUtils';
import { 
  FaShieldAlt, 
  FaSave, 
  FaUndo, 
  FaFingerprint,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const RoleAdd = ({ isEdit = false, roleData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    roleName: '',
    description: '',
    status: true
  });
  const [errors, setErrors] = useState({});

  const canCreateRole = hasPermission('ROLE_CREATE');
  const canUpdateRole = hasPermission('ROLE_UPDATE');

  useEffect(() => {
    if (isEdit && roleData) {
      setFormData({
        roleID: roleData.roleID || roleData.id,
        roleName: roleData.roleName || '',
        description: roleData.description || '',
        status: roleData.status ?? true
      });
    }
  }, [isEdit, roleData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && roleData) {
      setFormData({
        roleID: roleData.roleID || roleData.id,
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

    if (isEdit && !canUpdateRole) {
      toast.error('Identity Authorization: Update denied.');
      return;
    }
    if (!isEdit && !canCreateRole) {
      toast.error('Identity Authorization: Creation denied.');
      return;
    }

    // Validation
    const newErrors = {};
    if (!formData.roleName) newErrors.roleName = 'Authority designation required.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Protocol validation failed.');
      return;
    }

    const payload = {
      RoleID: isEdit ? (formData.roleID) : 0,
      RoleName: formData.roleName,
      Description: formData.description,
      Status: formData.status
    };

    try {
      let response;
      if (isEdit) {
        response = await updateRole(payload.RoleID, payload);
      } else {
        response = await createRole(payload);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Security hierarchy updated.' : 'New security node initialized.');
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
          toast.error('Constraint violation: Hierarchy rejected.');
        } else {
          toast.error(errorResponse?.message || 'Server-side protocol error.');
        }
      }
    } catch (error) {
      toast.error('Critical failure: Security registry unreachable.');
      console.error('Role operation error:', error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Role' : 'Add Role'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">System Access Management</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Role Name */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Role Name
              </label>
              <div className="relative">
                <FaFingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.roleName ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Admin"
                />
              </div>
              {errors.roleName && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 ml-1">{errors.roleName}</p>}
            </div>

            {/* Status */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                Status
              </label>
              <div className="flex items-center gap-4 h-[60px]">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: true }))}
                  className={`flex-1 h-full rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${
                    formData.status 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FaCheckCircle /> Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: false }))}
                  className={`flex-1 h-full rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${
                    !formData.status 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FaTimesCircle /> Inactive
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2 relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Role Description
              </label>
              <div className="relative">
                <FaFileAlt className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-100 transition-all font-bold text-gray-700 resize-none"
                  placeholder="Define the scope of authority for this security node..."
                />
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={handleReset}
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

export default RoleAdd;
