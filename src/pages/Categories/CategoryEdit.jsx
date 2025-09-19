import React, { useState, useEffect } from 'react';
import { getCategoryById, updateCategory } from '../../services/categoryService';
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

const CategoryEdit = () => {
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canEdit = user?.permissions?.includes('CATEGORY_UPDATE');

  useEffect(() => {
    if (!canEdit) {
      navigate('/access-denied');
      return;
    }

    const fetchCategory = async () => {
      try {
        const response = await getCategoryById(id);
        if (response.data.isSuccess) {
          setCategoryName(response.data.data.categoryName);
          setStatus(response.data.data.status);
        } else {
          toast.error(response.data.message || 'Failed to fetch category.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'An error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, canEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await updateCategory(id, { categoryID: parseInt(id), categoryName, status });
      toast.success('Category updated successfully!');
      navigate('/categories/list'); // Redirect to list after successful update
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
    return <div className="p-3 max-w-4xl mx-auto">Loading category...</div>;
  }

  if (!canEdit) {
    return null; // Should already be redirected by useEffect
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-[#424242]">Edit Category</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-[#424242] mb-1">Category Name</label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={categoryName}
                placeholder="Enter category name"
                onChange={(e) => setCategoryName(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.categoryName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none`}
              />
              {errors.categoryName && <p className="text-red-500 text-xs mt-1">{errors.categoryName}</p>}
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-[#424242] mb-1">Status</label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value === 'true')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E65100] focus:outline-none"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/categories/list')}
              className="px-5 py-2 rounded-md bg-[#F5F5F5] text-[#424242] hover:bg-[#E0E0E0] border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-[#E65100] text-white hover:bg-[#D84315] transition font-medium shadow"
            >
              Update Category
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default CategoryEdit;