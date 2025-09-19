import React, { useState, useEffect } from 'react';
import { createStaff } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';

const ValidationToast = ({ title, messages }) => (
  <div>
    <strong>{title}</strong>
    <ul style={{ whiteSpace: 'pre-wrap', textAlign: 'left', paddingLeft: '20px' }}>
      {messages.map((msg, index) => (
        <li key={index}>{msg}</li>
      ))}
    </ul>
  </div>
);

const StaffAdd = () => {
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [status, setStatus] = useState(true);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.permissions?.includes('STAFF_CREATE');

  useEffect(() => {
    if (!canCreate) {
      navigate('/access-denied');
    }
  }, [canCreate, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const staffData = {
        staffName,
        staffPhone,
        staffRole,
        status,
      };

      await createStaff(staffData);
      toast.success('Staff member created successfully!');
      navigate('/staff/list');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.details) {
        const newErrors = {};
        const errorMessages = err.response.data.details.map(error => {
          newErrors[error.propertyName.toLowerCase()] = error.errorMessage;
          return `- ${error.errorMessage}`;
        });
        setErrors(newErrors);
        toast.error(<ValidationToast title={err.response.data.message} messages={errorMessages} />);
      } else {
        toast.error(err.response?.data?.message || err.message || 'An error occurred.');
      }
      console.error(err);
    }
  };

  if (!canCreate) {
    return null;
  };

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Staff Member</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="staffName" className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
              <input
                type="text"
                id="staffName"
                name="staffName"
                value={staffName}
                placeholder="Enter staff name"
                onChange={(e) => setStaffName(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.staffName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.staffName && <p className="text-red-500 text-xs mt-1">{errors.staffName}</p>}
            </div>
            <div>
              <label htmlFor="staffPhone" className="block text-sm font-medium text-gray-700 mb-1">Staff Phone</label>
              <input
                type="text"
                id="staffPhone"
                name="staffPhone"
                value={staffPhone}
                placeholder="Enter staff phone"
                onChange={(e) => setStaffPhone(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.staffPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.staffPhone && <p className="text-red-500 text-xs mt-1">{errors.staffPhone}</p>}
            </div>
            <div>
              <label htmlFor="staffRole" className="block text-sm font-medium text-gray-700 mb-1">Staff Role</label>
              <input
                type="text"
                id="staffRole"
                name="staffRole"
                value={staffRole}
                placeholder="Enter staff role"
                onChange={(e) => setStaffRole(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.staffRole ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.staffRole && <p className="text-red-500 text-xs mt-1">{errors.staffRole}</p>}
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/staff/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Add Staff
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default StaffAdd;
