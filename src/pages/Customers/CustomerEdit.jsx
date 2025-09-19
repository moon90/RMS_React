import React, { useState, useEffect } from 'react';
import { getCustomerById, updateCustomer } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
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

const CustomerEdit = () => {
  const { id } = useParams();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [driverName, setDriverName] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canEdit = user?.permissions?.includes('CUSTOMER_UPDATE');

  useEffect(() => {
    if (!canEdit) {
      navigate('/access-denied');
      return;
    }

    const fetchCustomer = async () => {
      try {
        const response = await getCustomerById(id);
        if (response.data.isSuccess) {
          const customer = response.data.data;
          setCustomerName(customer.customerName);
          setCustomerPhone(customer.customerPhone || '');
          setCustomerEmail(customer.customerEmail || '');
          setAddress(customer.address || '');
          setDriverName(customer.driverName || '');
          setStatus(customer.status);
        } else {
          toast.error(response.data.message || 'Failed to fetch customer.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'An error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, canEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const customerData = {
        customerID: parseInt(id),
        customerName,
        customerPhone,
        customerEmail,
        address,
        driverName,
        status,
      };

      await updateCustomer(id, customerData);
      toast.success('Customer updated successfully!');
      navigate('/customers/list');
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

  if (loading) {
    return <div className="p-3 max-w-4xl mx-auto">Loading customer...</div>;
  }

  if (!canEdit) {
    return null;
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Customer</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={customerName}
                placeholder="Enter customer name"
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.customerName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
              <input
                type="text"
                id="customerPhone"
                name="customerPhone"
                value={customerPhone}
                placeholder="Enter customer phone"
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={customerEmail}
                placeholder="Enter customer email"
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                placeholder="Enter address"
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div>
              <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
              <input
                type="text"
                id="driverName"
                name="driverName"
                value={driverName}
                placeholder="Enter driver name"
                onChange={(e) => setDriverName(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.driverName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.driverName && <p className="text-red-500 text-xs mt-1">{errors.driverName}</p>}
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
              onClick={() => navigate('/customers/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Update Customer
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default CustomerEdit;
