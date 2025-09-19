import React, { useState, useEffect } from 'react';
import { createInventory } from '../../services/inventoryService';
import { getAllProducts } from '../../services/productService'; // Assuming you need to select a product
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

const InventoryAdd = () => {
  const [productID, setProductID] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [status, setStatus] = useState(true);
  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.permissions?.includes('INVENTORY_CREATE');

  useEffect(() => {
    if (!canCreate) {
      navigate('/access-denied');
    }

    const fetchDependencies = async () => {
      try {
        const productsRes = await getAllProducts({ pageNumber: 1, pageSize: 1000, status: true });
        if (productsRes.data.isSuccess) {
          setProducts(productsRes.data.data.items);
        }
      } catch (error) {
        toast.error('Failed to load dependencies.');
        console.error(error);
      }
    };

    fetchDependencies();
  }, [canCreate, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const inventoryData = {
        productID: parseInt(productID),
        initialStock: parseInt(initialStock),
        currentStock: parseInt(currentStock),
        minStockLevel: parseInt(minStockLevel),
        status: status,
      };

      await createInventory(inventoryData);
      toast.success('Inventory item created successfully!');
      navigate('/inventory/list');
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Inventory Item</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="productID" className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                id="productID"
                name="productID"
                value={productID}
                onChange={(e) => setProductID(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.productID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Product</option>
                {products.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.productName}</option>
                ))}
              </select>
              {errors.productID && <p className="text-red-500 text-xs mt-1">{errors.productID}</p>}
            </div>
            <div>
              <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
              <input
                type="number"
                id="initialStock"
                name="initialStock"
                value={initialStock}
                placeholder="Enter initial stock"
                onChange={(e) => setInitialStock(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.initialStock ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.initialStock && <p className="text-red-500 text-xs mt-1">{errors.initialStock}</p>}
            </div>
            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
              <input
                type="number"
                id="currentStock"
                name="currentStock"
                value={currentStock}
                placeholder="Enter current stock"
                onChange={(e) => setCurrentStock(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.currentStock ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.currentStock && <p className="text-red-500 text-xs mt-1">{errors.currentStock}</p>}
            </div>
            <div>
              <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
              <input
                type="number"
                id="minStockLevel"
                name="minStockLevel"
                value={minStockLevel}
                placeholder="Enter minimum stock level"
                onChange={(e) => setMinStockLevel(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.minStockLevel ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.minStockLevel && <p className="text-red-500 text-xs mt-1">{errors.minStockLevel}</p>}
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
              onClick={() => navigate('/inventory/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Add Inventory
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default InventoryAdd;