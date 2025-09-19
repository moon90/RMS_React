import React, { useState, useEffect } from 'react';
import { createProductIngredient } from '../../services/productIngredientService';
import { getAllProducts } from '../../services/productService';
import { getAllIngredients } from '../../services/ingredientService';
import { getAllUnits } from '../../services/unitService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';

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

const ProductIngredientAdd = () => {
  const [productID, setProductID] = useState('');
  const [ingredients, setIngredients] = useState([{ ingredientID: '', quantity: '', unitID: '', remarks: '', status: true, availableQuantity: 0 }]);
  const [allProducts, setAllProducts] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.permissions?.includes('PRODUCT_INGREDIENT_CREATE');

  useEffect(() => {
    if (!canCreate) {
      navigate('/access-denied');
    }

    const fetchDependencies = async () => {
      try {
        const [productsRes, ingredientsRes, unitsRes] = await Promise.all([
          getAllProducts({ pageNumber: 1, pageSize: 1000, status: true }),
          getAllIngredients({ pageNumber: 1, pageSize: 1000, status: true }),
          getAllUnits({ pageNumber: 1, pageSize: 1000, status: true }),
        ]);

        if (productsRes.data.isSuccess) {
          setAllProducts(productsRes.data.data.items);
        }
        if (ingredientsRes.data.isSuccess) {
          setAllIngredients(ingredientsRes.data.data.items);
        }
        if (unitsRes.data.isSuccess) {
          setAllUnits(unitsRes.data.data.items);
        }
      } catch (error) {
        toast.error('Failed to load dependencies.');
        console.error(error);
      }
    };

    fetchDependencies();
  }, [canCreate, navigate]);

  const handleIngredientChange = (index, event) => {
    const { name, value } = event.target;
    const newIngredients = [...ingredients];
    newIngredients[index][name] = value;

    if (name === 'ingredientID') {
      const selectedIngredient = allIngredients.find(ing => ing.ingredientID === parseInt(value));
      if (selectedIngredient) {
        newIngredients[index].availableQuantity = selectedIngredient.quantityInStock;
      }
    }

    if (name === 'quantity') {
        const available = newIngredients[index].availableQuantity;
        if (parseFloat(value) > available) {
            toast.error(`Only ${available} in stock for this ingredient.`);
        }
    }

    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredientID: '', quantity: '', unitID: '', remarks: '', status: true, availableQuantity: 0 }]);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    if (!productID) {
      toast.error('Please select a product.');
      return;
    }

    try {
      for (const ingredient of ingredients) {
        if (!ingredient.ingredientID || !ingredient.quantity || !ingredient.unitID) {
          toast.error('Please fill all fields for each ingredient.');
          return;
        }
        if (parseFloat(ingredient.quantity) > ingredient.availableQuantity) {
            toast.error(`Not enough stock for ${allIngredients.find(i => i.ingredientID === parseInt(ingredient.ingredientID)).name}.`);
            return;
        }

        const productIngredientData = {
          productID: parseInt(productID),
          ingredientID: parseInt(ingredient.ingredientID),
          quantity: parseFloat(ingredient.quantity),
          unitID: parseInt(ingredient.unitID),
          remarks: ingredient.remarks,
          status: ingredient.status,
        };
        await createProductIngredient(productIngredientData);
      }

      toast.success('Product ingredients created successfully!');
      navigate('/product-ingredients/list');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.details) {
        const errorMessages = err.response.data.details.map(error => {
          return `- ${error.errorMessage}`;
        });
        
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product Ingredient</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="productID" className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              id="productID"
              name="productID"
              value={productID}
              onChange={(e) => setProductID(e.target.value)}
              required
              className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            >
              <option value="">Select Product</option>
              {allProducts.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.productName}</option>
              ))}
            </select>
            
          </div>

          <hr />

          {ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-6 border-b pb-4">
              <div className="md:col-span-2">
                <label htmlFor={`ingredientID-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                <select
                  id={`ingredientID-${index}`}
                  name="ingredientID"
                  value={ingredient.ingredientID}
                  onChange={(e) => handleIngredientChange(index, e)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Ingredient</option>
                  {allIngredients.map(ing => (
                    <option key={ing.ingredientID} value={ing.ingredientID}>{ing.name} ({ing.quantityInStock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  id={`quantity-${index}`}
                  name="quantity"
                  value={ingredient.quantity}
                  placeholder="Qty"
                  onChange={(e) => handleIngredientChange(index, e)}
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor={`unitID-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  id={`unitID-${index}`}
                  name="unitID"
                  value={ingredient.unitID}
                  onChange={(e) => handleIngredientChange(index, e)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Unit</option>
                  {allUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor={`remarks-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  id={`remarks-${index}`}
                  name="remarks"
                  value={ingredient.remarks}
                  placeholder="Remarks"
                  onChange={(e) => handleIngredientChange(index, e)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addIngredient}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            Add Ingredient
          </button>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/product-ingredients/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Add Product Ingredients
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default ProductIngredientAdd;
''