import React, { useState, useEffect } from 'react';
import { createStaff, updateStaff } from '../../services/staffService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaUserFriends, 
  FaSave, 
  FaUndo, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUserTag,
  FaPhone,
  FaFingerprint
} from 'react-icons/fa';

const StaffAdd = ({ isEdit = false, staffData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    staffName: '',
    staffPhone: '',
    staffRole: '',
    status: true
  });
  const [errors, setErrors] = useState({});

  const canCreate = hasPermission('STAFF_CREATE');
  const canUpdate = hasPermission('STAFF_UPDATE');

  useEffect(() => {
    if (isEdit && staffData) {
      setFormData({
        staffID: staffData.staffID,
        staffName: staffData.staffName || '',
        staffPhone: staffData.staffPhone || '',
        staffRole: staffData.staffRole || '',
        status: staffData.status ?? true
      });
    }
  }, [isEdit, staffData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && staffData) {
      setFormData({
        staffID: staffData.staffID,
        staffName: staffData.staffName || '',
        staffPhone: staffData.staffPhone || '',
        staffRole: staffData.staffRole || '',
        status: staffData.status ?? true
      });
    } else {
      setFormData({
        staffName: '',
        staffPhone: '',
        staffRole: '',
        status: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (isEdit && !canUpdate) {
      toast.error('Identity Authorization: Update denied.');
      return;
    }
    if (!isEdit && !canCreate) {
      toast.error('Identity Authorization: Creation denied.');
      return;
    }

    try {
      let response;
      if (isEdit) {
        response = await updateStaff(formData.staffID, formData);
      } else {
        response = await createStaff(formData);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Staff credentials updated.' : 'New staff node saved.');
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
          toast.error('Constraint violation: Profile rejected.');
        } else {
          toast.error(errorResponse?.message || 'Server-side protocol error.');
        }
      }
    } catch (error) {
      toast.error('Critical failure: Staff list unreachable.');
      console.error('Staff operation error:', error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto text-left">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaUserFriends className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Refine Profile' : 'Add Staff'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Global Staff List</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Staff Name */}
            <div className="relative group md:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Full Identity Designation
              </label>
              <div className="relative">
                <FaUserFriends className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="staffName"
                  value={formData.staffName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.staffname ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Robert Penner"
                  required
                />
              </div>
            </div>

            {/* Staff Role */}
            <div className="relative group md:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Organizational Role
              </label>
              <div className="relative">
                <FaUserTag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="staffRole"
                  value={formData.staffRole}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.staffrole ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Senior Architect"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative group md:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Phone (Phone)
              </label>
              <div className="relative">
                <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="tel"
                  name="staffPhone"
                  value={formData.staffPhone}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.staffphone ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="+880 1xxx xxxxx"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="relative group md:col-span-1">
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
                  <FaTimesCircle className={!formData.status ? 'text-red-500' : 'text-gray-300'} />Inactive</button>
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
              <FaUndo />Reset</button>
            <button
              type="submit"
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
            >
              <FaSave /> {isEdit ? 'Commit Changes' : 'Add Staff'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default StaffAdd;
