import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDiningTable } from '../../services/diningTableService';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import FormCard from '../../components/FormCard';

const DiningTableAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tableName: '',
    status: true, // Default to available
    diningTableStatus: 'Available', // Initialize with a default enum value
  });
  const { user } = useAuth();
  const canCreate = user?.permissions?.includes('DINING_TABLE_CREATE');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tableName.trim()) {
      newErrors.tableName = "Table Name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors.");
      return;
    }

    try {
      await createDiningTable(formData);
      toast.success("Dining table added successfully!");
      navigate('/dining-tables/list');
    } catch (error) {
      toast.error("Failed to add dining table.");
      console.error("Error adding dining table:", error);
    }
  };

  if (!canCreate) {
    return null; // Or a loading spinner/message while redirecting
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-[#424242]">Add New Dining Table</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="tableName" className="block text-sm font-medium text-[#424242] mb-1">Table Name</label>
              <input
                type="text"
                id="tableName"
                name="tableName"
                value={formData.tableName}
                placeholder="Enter table name"
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border ${errors.tableName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
              />
              {errors.tableName && <p className="text-red-500 text-xs mt-1">{errors.tableName}</p>}
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-[#424242] mb-1">Active Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div>
              <label htmlFor="diningTableStatus" className="block text-sm font-medium text-[#424242] mb-1">Dining Table Status</label>
              <select
                id="diningTableStatus"
                name="diningTableStatus"
                value={formData.diningTableStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dining-tables/list')}
              className="px-5 py-2 rounded-md bg-[#F5F5F5] text-[#424242] hover:bg-[#E0E0E0] border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-[#E65100] text-white hover:bg-[#D84315] transition font-medium shadow"
            >
              Add Table
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default DiningTableAdd;
