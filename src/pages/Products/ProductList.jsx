import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllProducts, deleteProduct, toggleProductStatus } from '../../services/productService';
import { getAllCategories } from '../../services/categoryService';
import { getAllSuppliers } from '../../services/supplierService';
import { getAllManufacturers } from '../../services/manufacturerService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { toast } from 'react-toastify';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('ProductName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canView = user?.permissions?.includes('PRODUCT_VIEW');
  const canCreate = user?.permissions?.includes('PRODUCT_CREATE');
  const canEdit = user?.permissions?.includes('PRODUCT_UPDATE');
  const canDelete = user?.permissions?.includes('PRODUCT_DELETE');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: statusFilter,
        categoryID: categoryFilter,
        supplierID: supplierFilter,
        manufacturerID: manufacturerFilter,
      };
      const response = await getAllProducts(params);
      if (response.data.isSuccess) {
        setProducts(response.data.data.items);
        setTotalProducts(response.data.data.totalRecords || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch products');
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching products.');
      console.error(error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter, categoryFilter, supplierFilter, manufacturerFilter]);

  const fetchDependencies = useCallback(async () => {
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
      toast.error('Failed to load filter options.');
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    fetchDependencies();
    fetchProducts();
  }, [canView, navigate, fetchProducts, fetchDependencies]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleSort = (field) => {
    if (isLoading) return;
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setItemsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete products.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this product?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteProduct(id);
                  if (response.data.isSuccess) {
                    toast.success('Product deleted successfully');
                  } else {
                    toast.error(response.data.message || 'Failed to delete product');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the product.');
                  }
                  console.error(error);
                } finally {
                  fetchProducts();
                  closeToast();
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false
      }
    );
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canEdit) {
      toast.error('You do not have permission to change the status of a product.');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">
            Are you sure you want to {actionText} this product?
          </span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await toggleProductStatus(id, newStatus);
                  if (response.data.isSuccess) {
                    toast.success(`Product ${actionText}d successfully`);
                    fetchProducts();
                  } else {
                    toast.error(response.data.message || `Failed to ${actionText} product`);
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error(`An error occurred while trying to ${actionText} the product.`);
                  }
                  console.error(error);
                } finally {
                  closeToast();
                }
              }}
              className={`px-3 py-1 text-sm text-white rounded ${
                newStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {newStatus ? 'Activate' : 'Deactivate'}
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Product List</h2>
        {canCreate && (
          <button
            onClick={() => navigate('/products/add')}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add Product
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchChange}
            disabled={isLoading}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Suppliers</option>
            {suppliers.map(sup => (
              <option key={sup.id} value={sup.id}>{sup.supplierName}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={manufacturerFilter}
            onChange={(e) => setManufacturerFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Manufacturers</option>
            {manufacturers.map(man => (
              <option key={man.id} value={man.id}>{man.manufacturerName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Image</th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('ProductName')}
              >
                <div className="flex items-center">
                  Product Name
                  {sortField === 'ProductName' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('ProductPrice')}>Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Category.CategoryName')}>Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Supplier.SupplierName')}>Supplier</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('Manufacturer.ManufacturerName')}>Manufacturer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('StockQuantity')}>Stock Quantity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">Loading...</td>
              </tr>
            ) : products.length > 0 ? (
              products.map((product, idx) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4">
                    <img 
                      src={product.thumbnailImage || '/images/placeholder.png'} 
                      alt={product.productName} 
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png'; }}
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.productName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.productPrice}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.categoryName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.supplierName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.manufacturerName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{product.stockQuantity || 0}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button 
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit product"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                          </svg>
                        </button>
                      )}
                      {canEdit && (
                        <button 
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Toggle active status"
                        >
                          {product.status ? ( // Change icon based on active status
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete product"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <ProfessionalPagination
          count={totalProducts}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
};

export default ProductList;
