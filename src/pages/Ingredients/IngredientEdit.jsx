import React, { useState, useEffect } from 'react';
import { getIngredientById, updateIngredient } from '../../services/ingredientService';
import { getAllUnits } from '../../services/unitService';
import { getAllSuppliers } from '../../services/supplierService';
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

const IngredientEdit = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState('');
  const [unitID, setUnitID] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [reorderQuantity, setReorderQuantity] = useState('');
  const [supplierID, setSupplierID] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState(true);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canEdit = user?.permissions?.includes('INGREDIENT_UPDATE');

  useEffect(() => {
    if (!canEdit) {
      navigate('/access-denied');
      return;
    }

    const fetchDependencies = async () => {
      try {
        const [unitsRes, suppliersRes] = await Promise.all([
          getAllUnits({ pageNumber: 1, pageSize: 1000, status: true }),
          getAllSuppliers({ pageNumber: 1, pageSize: 1000, status: true }),
        ]);

        if (unitsRes.data.isSuccess) {
          setUnits(unitsRes.data.data.items);
        }
        if (suppliersRes.data.isSuccess) {
          setSuppliers(suppliersRes.data.data.items);
        }
      } catch (error) {
        toast.error('Failed to load dependencies.');
        console.error(error);
      }
    };

    const fetchIngredient = async () => {
      try {
        const response = await getIngredientById(id);
        if (response.data.isSuccess) {
          const ingredient = response.data.data;
          setName(ingredient.name);
          setQuantityAvailable(ingredient.quantityAvailable);
          setUnitID(ingredient.unitID ? String(ingredient.unitID) : '');
          setReorderLevel(ingredient.reorderLevel);
          setReorderQuantity(ingredient.reorderQuantity);
          setSupplierID(ingredient.supplierID ? String(ingredient.supplierID) : '');
          setExpireDate(ingredient.expireDate ? new Date(ingredient.expireDate).toISOString().split('T')[0] : '');
          setRemarks(ingredient.remarks);
          setStatus(ingredient.status);
        } else {
          toast.error(response.data.message || 'Failed to fetch ingredient.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'An error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
    fetchIngredient();
  }, [id, canEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const ingredientData = {
        ingredientID: parseInt(id),
        name: name,
        quantityAvailable: parseFloat(quantityAvailable),
        unitID: parseInt(unitID),
        reorderLevel: parseFloat(reorderLevel),
        reorderQuantity: parseFloat(reorderQuantity),
        supplierID: supplierID ? parseInt(supplierID) : null,
        expireDate: expireDate ? new Date(expireDate).toISOString() : null,
        remarks: remarks,
        status: status,
      };

      await updateIngredient(id, ingredientData);
      toast.success('Ingredient updated successfully!');
      navigate('/ingredients/list');
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
    return <div className="p-3 max-w-4xl mx-auto">Loading ingredient...</div>;
  }

  if (!canEdit) {
    return null;
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Ingredient</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                placeholder="Enter ingredient name"
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="quantityAvailable" className="block text-sm font-medium text-gray-700 mb-1">Quantity Available</label>
              <input
                type="number"
                id="quantityAvailable"
                name="quantityAvailable"
                value={quantityAvailable}
                placeholder="Enter quantity available"
                onChange={(e) => setQuantityAvailable(e.target.value)}
                required
                step="0.01"
                className={`w-full px-4 py-2 border ${errors.quantityAvailable ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.quantityAvailable && <p className="text-red-500 text-xs mt-1">{errors.quantityAvailable}</p>}
            </div>
            <div>
              <label htmlFor="unitID" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                id="unitID"
                name="unitID"
                value={unitID}
                onChange={(e) => setUnitID(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.unitID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Unit</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
              {errors.unitID && <p className="text-red-500 text-xs mt-1">{errors.unitID}</p>}
            </div>
            <div>
              <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
              <input
                type="number"
                id="reorderLevel"
                name="reorderLevel"
                value={reorderLevel}
                placeholder="Enter reorder level"
                onChange={(e) => setReorderLevel(e.target.value)}
                required
                step="0.01"
                className={`w-full px-4 py-2 border ${errors.reorderLevel ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.reorderLevel && <p className="text-red-500 text-xs mt-1">{errors.reorderLevel}</p>}
            </div>
            <div>
              <label htmlFor="reorderQuantity" className="block text-sm font-medium text-gray-700 mb-1">Reorder Quantity</label>
              <input
                type="number"
                id="reorderQuantity"
                name="reorderQuantity"
                value={reorderQuantity}
                placeholder="Enter reorder quantity"
                onChange={(e) => setReorderQuantity(e.target.value)}
                required
                step="0.01"
                className={`w-full px-4 py-2 border ${errors.reorderQuantity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.reorderQuantity && <p className="text-red-500 text-xs mt-1">{errors.reorderQuantity}</p>}
            </div>
            <div>
              <label htmlFor="supplierID" className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                id="supplierID"
                name="supplierID"
                value={supplierID}
                onChange={(e) => setSupplierID(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.supplierID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.supplierName}</option>
                ))}
              </select>
              {errors.supplierID && <p className="text-red-500 text-xs mt-1">{errors.supplierID}</p>}
            </div>
            <div>
              <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700 mb-1">Expire Date</label>
              <input
                type="date"
                id="expireDate"
                name="expireDate"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.expireDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.expireDate && <p className="text-red-500 text-xs mt-1">{errors.expireDate}</p>}
            </div>
            <div className="col-span-2">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                value={remarks}
                placeholder="Enter remarks"
                onChange={(e) => setRemarks(e.target.value)}
                rows="3"
                className={`w-full px-4 py-2 border ${errors.remarks ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              ></textarea>
              {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
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
              onClick={() => navigate('/ingredients/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Update Ingredient
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default IngredientEdit;