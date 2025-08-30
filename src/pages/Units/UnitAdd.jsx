import React, { useState, useEffect } from 'react';
import { createUnit } from '../../services/unitService';
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

const UnitAdd = () => {
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [status, setStatus] = useState(true);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.permissions?.includes('UNIT_CREATE');

  useEffect(() => {
    if (!canCreate) {
      navigate('/access-denied');
    }
  }, [canCreate, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await createUnit({ name, shortCode, status });
      toast.success('Unit created successfully!');
      setName('');
      setShortCode('');
      setStatus(true);
      navigate('/units/list');
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
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Unit</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                placeholder="Enter unit name"
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="shortCode" className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
              <input
                type="text"
                id="shortCode"
                name="shortCode"
                value={shortCode}
                placeholder="Enter short code"
                onChange={(e) => setShortCode(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.shortCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.shortCode && <p className="text-red-500 text-xs mt-1">{errors.shortCode}</p>}
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
              onClick={() => navigate('/units/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Add Unit
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default UnitAdd;
