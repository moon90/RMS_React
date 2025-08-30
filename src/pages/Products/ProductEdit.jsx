
import React, { useState, useEffect } from 'react';
import { getProductById, updateProduct } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getAllSuppliers } from '../../services/supplierService';
import { getAllManufacturers } from '../../services/manufacturerService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import FormCard from '../../components/FormCard.jsx';
import { toast } from 'react-toastify';
import { validateImage } from '../../utils/imageValidation'; // Added

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

const ProductEdit = () => {
  const { id } = useParams();
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [productBarcode, setProductBarcode] = useState('');
  const [productImageFile, setProductImageFile] = useState(null);
  const [thumbnailImageFile, setThumbnailImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [thumbnailImagePreview, setThumbnailImagePreview] = useState(null);
  const [existingProductImageUrl, setExistingProductImageUrl] = useState(null);
  const [existingProductThumbnailUrl, setExistingProductThumbnailUrl] = useState(null);
  const [categoryID, setCategoryID] = useState('');
  const [supplierID, setSupplierID] = useState('');
  const [manufacturerID, setManufacturerID] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [status, setStatus] = useState(true);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const canEdit = user?.permissions?.includes('PRODUCT_UPDATE');

  useEffect(() => {
    if (!canEdit) {
      navigate('/access-denied');
      return;
    }

    const fetchDependencies = async () => {
      try {
        const [categoriesRes, suppliersRes, manufacturersRes] = await Promise.all([
          getAllCategories({ pageNumber: 1, pageSize: 1000, status: true }),
          getAllSuppliers({ pageNumber: 1, pageSize: 1000, status: true }),
          getAllManufacturers({ pageNumber: 1, pageSize: 1000, status: true }),
        ]);

        if (categoriesRes.data.isSuccess) {
          setCategories(categoriesRes.data.data.items);
        }
        if (suppliersRes.data.isSuccess) {
          setSuppliers(suppliersRes.data.data.items);
        }
        if (manufacturersRes.data.isSuccess) {
          setManufacturers(manufacturersRes.data.data.items);
        }
      } catch (error) {
        toast.error('Failed to load dependencies.');
        console.error(error);
      }
    };

    const fetchProduct = async () => {
      try {
        const response = await getProductById(id);
        if (response.data.isSuccess) {
          const product = response.data.data;
          setProductName(product.productName);
          setProductPrice(product.productPrice);
          setCostPrice(product.costPrice);
          setProductBarcode(product.productBarcode);
          setProductImagePreview(product.imageUrl); // Set initial preview from URL
          setThumbnailImagePreview(product.thumbnailUrl); // Set initial preview from URL
          setExistingProductImageUrl(product.imageUrl); // Store existing URL
          setExistingProductThumbnailUrl(product.thumbnailUrl); // Store existing URL
          setCategoryID(product.categoryID || '');
          setSupplierID(product.supplierID || '');
          setManufacturerID(product.manufacturerID || '');
          setExpireDate(product.expireDate ? new Date(product.expireDate).toISOString().split('T')[0] : '');
          setStatus(product.status);
        } else {
          toast.error(response.data.message || 'Failed to fetch product.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'An error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
    fetchProduct();
  }, [id, canEdit, navigate]);

  const handleImageChange = (e, setImageFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      const validationResult = validateImage(file); // Validate the image
      if (!validationResult.isValid) {
        toast.error(validationResult.message);
        e.target.value = null; // Clear the file input
        setImageFile(null);
        setPreview(null);
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreview(null);
    }
  };

  const handleRemoveImage = (setImageFile, setPreview, setExistingUrl) => {
    setImageFile(null);
    setPreview(null);
    setExistingUrl(null); // Clear the existing URL as well
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Frontend validation for images before sending
    if (productImageFile) {
      const validationResult = validateImage(productImageFile);
      if (!validationResult.isValid) {
        toast.error(`Product Image: ${validationResult.message}`);
        return;
      }
    }
    if (thumbnailImageFile) {
      const validationResult = validateImage(thumbnailImageFile);
      if (!validationResult.isValid) {
        toast.error(`Thumbnail Image: ${validationResult.message}`);
        return;
      }
    }

    try {
      const formData = new FormData();

      formData.append('id', parseInt(id));
      formData.append('productName', productName);
      formData.append('productPrice', parseFloat(productPrice));
      if (costPrice) formData.append('costPrice', parseFloat(costPrice));
      if (productBarcode) formData.append('productBarcode', productBarcode);

      // Handle product image
      if (productImageFile) {
        formData.append('productImageFile', productImageFile);
      } else if (productImagePreview === null && existingProductImageUrl) {
        // If image was cleared and there was an existing image, send empty string to signal deletion
        formData.append('imageUrl', '');
      } else if (existingProductImageUrl) {
        // If no new file and no clear, keep existing URL
        formData.append('imageUrl', existingProductImageUrl);
      }

      // Handle thumbnail image
      if (thumbnailImageFile) {
        formData.append('thumbnailImageFile', thumbnailImageFile);
      } else if (thumbnailImagePreview === null && existingProductThumbnailUrl) {
        // If thumbnail was cleared and there was an existing thumbnail, send empty string to signal deletion
        formData.append('thumbnailUrl', '');
      } else if (existingProductThumbnailUrl) {
        // If no new file and no clear, keep existing URL
        formData.append('thumbnailUrl', existingProductThumbnailUrl);
      }

      formData.append('categoryID', categoryID ? parseInt(categoryID) : '');
      formData.append('supplierID', supplierID ? parseInt(supplierID) : '');
      formData.append('manufacturerID', manufacturerID ? parseInt(manufacturerID) : '');
      formData.append('expireDate', expireDate ? new Date(expireDate).toISOString() : '');
      formData.append('status', status);

      await updateProduct(id, formData);
      toast.success('Product updated successfully!');
      navigate('/products/list');
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
    return <div className="p-3 max-w-4xl mx-auto">Loading product...</div>;
  }

  if (!canEdit) {
    return null;
  }

  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={productName}
                placeholder="Enter product name"
                onChange={(e) => setProductName(e.target.value)}
                required
                className={`w-full px-4 py-2 border ${errors.productName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
            </div>
            <div>
              <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-1">Product Price</label>
              <input
                type="number"
                id="productPrice"
                name="productPrice"
                value={productPrice}
                placeholder="Enter product price"
                onChange={(e) => setProductPrice(e.target.value)}
                required
                step="0.01"
                className={`w-full px-4 py-2 border ${errors.productPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.productPrice && <p className="text-red-500 text-xs mt-1">{errors.productPrice}</p>}
            </div>
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
              <input
                type="number"
                id="costPrice"
                name="costPrice"
                value={costPrice}
                placeholder="Enter cost price"
                onChange={(e) => setCostPrice(e.target.value)}
                step="0.01"
                className={`w-full px-4 py-2 border ${errors.costPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>}
            </div>
            <div>
              <label htmlFor="productBarcode" className="block text-sm font-medium text-gray-700 mb-1">Product Barcode</label>
              <input
                type="text"
                id="productBarcode"
                name="productBarcode"
                value={productBarcode}
                placeholder="Enter product barcode"
                onChange={(e) => setProductBarcode(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.productBarcode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.productBarcode && <p className="text-red-500 text-xs mt-1">{errors.productBarcode}</p>}
            </div>
            <div>
              <label htmlFor="productImage" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <input
                type="file"
                id="productImage"
                name="productImage"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setProductImageFile, setProductImagePreview)}
                className={`w-full px-4 py-2 border ${errors.productImage ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.productImage && <p className="text-red-500 text-xs mt-1">{errors.productImage}</p>}
              <div className="mt-2 flex items-center space-x-2">
                <img src={productImagePreview || existingProductImageUrl || '/images/placeholder.png'} alt="Product Preview" className="h-32 w-32 object-cover" />
                {(productImagePreview || existingProductImageUrl) && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(setProductImageFile, setProductImagePreview, setExistingProductImageUrl)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="thumbnailImage" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
              <input
                type="file"
                id="thumbnailImage"
                name="thumbnailImage"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setThumbnailImageFile, setThumbnailImagePreview)}
                className={`w-full px-4 py-2 border ${errors.thumbnailImage ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.thumbnailImage && <p className="text-red-500 text-xs mt-1">{errors.thumbnailImage}</p>}
              <div className="mt-2 flex items-center space-x-2">
                <img src={thumbnailImagePreview || existingProductThumbnailUrl || '/images/placeholder.png'} alt="Thumbnail Preview" className="h-32 w-32 object-cover" />
                {(thumbnailImagePreview || existingProductThumbnailUrl) && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(setThumbnailImageFile, setThumbnailImagePreview, setExistingProductThumbnailUrl)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="categoryID" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="categoryID"
                name="categoryID"
                value={categoryID}
                onChange={(e) => setCategoryID(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.categoryID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
              {errors.categoryID && <p className="text-red-500 text-xs mt-1">{errors.categoryID}</p>}
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
              <label htmlFor="manufacturerID" className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <select
                id="manufacturerID"
                name="manufacturerID"
                value={manufacturerID}
                onChange={(e) => setManufacturerID(e.target.value)}
                className={`w-full px-4 py-2 border ${errors.manufacturerID ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Manufacturer</option>
                {manufacturers.map(man => (
                  <option key={man.id} value={man.id}>{man.manufacturerName}</option>
                ))}
              </select>
              {errors.manufacturerID && <p className="text-red-500 text-xs mt-1">{errors.manufacturerID}</p>}
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
              onClick={() => navigate('/products/list')}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              Update Product
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default ProductEdit;
