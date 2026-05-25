import React, { useState, useEffect } from 'react';
import { createCustomer, updateCustomer } from '../../services/customerService';
import { hasPermission } from '../../utils/permissionUtils';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { 
  FaUserTag, 
  FaSave, 
  FaUndo, 
  FaCheckCircle, 
  FaTimesCircle,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCar,
  FaFingerprint
} from 'react-icons/fa';

const CustomerAdd = ({ isEdit = false, customerData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    driverName: '',
    status: true
  });
  const [errors, setErrors] = useState({});

  const canCreate = hasPermission('CUSTOMER_CREATE');
  const canUpdate = hasPermission('CUSTOMER_UPDATE');

  useEffect(() => {
    if (isEdit && customerData) {
      setFormData({
        customerID: customerData.customerID,
        customerName: customerData.customerName || '',
        customerPhone: customerData.customerPhone || '',
        customerEmail: customerData.customerEmail || '',
        address: customerData.address || '',
        driverName: customerData.driverName || '',
        status: customerData.status ?? true
      });
    }
  }, [isEdit, customerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && customerData) {
      setFormData({
        customerID: customerData.customerID,
        customerName: customerData.customerName || '',
        customerPhone: customerData.customerPhone || '',
        customerEmail: customerData.customerEmail || '',
        address: customerData.address || '',
        driverName: customerData.driverName || '',
        status: customerData.status ?? true
      });
    } else {
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        address: '',
        driverName: '',
        status: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customername = 'Customer name is required';
    if (!formData.customerPhone.trim()) newErrors.customerphone = 'Phone number is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.customerEmail && !emailRegex.test(formData.customerEmail)) {
      newErrors.customeremail = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Validation Error: Please review customer profile.');
      return;
    }

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
        response = await updateCustomer(formData.customerID, formData);
      } else {
        response = await createCustomer(formData);
      }

      if (response.data.isSuccess) {
        toast.success(isEdit ? 'Customer profile updated.' : 'New customer node saved.');
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
          toast.error('Constraint violation: Customer profile rejected.');
        } else {
          toast.error(errorResponse?.message || 'Server-side protocol error.');
        }
      }
    } catch (error) {
      toast.error('Critical failure: Customer list unreachable.');
      console.error('Customer operation error:', error);
    }
  };

  return (
    <div className="p-3 max-w-4xl mx-auto text-left">
      <FormCard>
        {showTitle && (
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100">
              <FaUserTag className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isEdit ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Customer List</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Name */}
            <div className="relative group md:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Customer Name
              </label>
              <div className="relative">
                <FaUserTag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.customername ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
            </div>

            {/* Driver Name */}
            <div className="relative group md:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Assigned Contact Lead (Driver)
              </label>
              <div className="relative">
                <FaCar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.drivername ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="e.g. Michael Smith"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Phone (Phone)
              </label>
              <div className="relative">
                <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.customerphone ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="+880 1xxx xxxxx"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 ${
                    errors.customeremail ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="client@acme.com"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2 relative group">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-blue-600 transition-colors">
                Address
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-5 top-6 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full pl-14 pr-6 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all font-bold text-gray-700 min-h-[120px] ${
                    errors.address ? 'border-red-100 focus:border-red-400' : 'border-transparent focus:border-blue-100 focus:bg-white'
                  }`}
                  placeholder="Enter complete logistical delivery address..."
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
              <FaSave /> {isEdit ? 'Commit Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default CustomerAdd;
