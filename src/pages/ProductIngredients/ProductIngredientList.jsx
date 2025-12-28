import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllProductIngredients, deleteProductIngredient } from '../../services/productIngredientService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { toast } from 'react-toastify';

const ProductIngredientList = () => {
  const [productIngredients, setProductIngredients] = useState([]);
  const [totalProductIngredients, setTotalProductIngredients] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('productName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canView = user?.permissions?.includes('PRODUCT_INGREDIENT_VIEW');
  const canCreate = user?.permissions?.includes('PRODUCT_INGREDIENT_CREATE');
  const canEdit = user?.permissions?.includes('PRODUCT_INGREDIENT_UPDATE');
  const canDelete = user?.permissions?.includes('PRODUCT_INGREDIENT_DELETE');

  const fetchProductIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: statusFilter,
      };
      const response = await getAllProductIngredients(params);
      if (response.data.isSuccess) {
        const groupedIngredients = response.data.data.items.reduce((acc, item) => {
          const existing = acc.find(i => i.productID === item.productID);
          if (existing) {
            existing.ingredients.push(item);
          } else {
            acc.push({
              productID: item.productID,
              productName: item.productName,
              ingredients: [item]
            });
          }
          return acc;
        }, []);
        setProductIngredients(groupedIngredients);
        setTotalProductIngredients(response.data.data.totalRecords || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch product ingredients');
        setProductIngredients([]);
        setTotalProductIngredients(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching product ingredients.');
      console.error(error);
      setProductIngredients([]);
      setTotalProductIngredients(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    fetchProductIngredients();
  }, [canView, navigate, fetchProductIngredients]);

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
      toast.error('You do not have permission to delete product ingredient.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this product ingredient?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteProductIngredient(id);
                  if (response.data.isSuccess) {
                    toast.success('Product ingredient deleted successfully');
                    fetchProductIngredients();
                  } else {
                    toast.error(response.data.message || 'Failed to delete product ingredient');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the product ingredient.');
                  }
                  console.error(error);
                } finally {
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

  

  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Product Ingredient List</h2>
        {canCreate && (
          <button
            onClick={() => navigate('/product-ingredients/add')}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add Product Ingredient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search product ingredients..."
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
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center">
                  Product Name
                  {sortField === 'productName' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center py-4">Loading...</td>
              </tr>
            ) : productIngredients.length > 0 ? (
              productIngredients.map((product, idx) => (
                <React.Fragment key={product.productID}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{product.productName}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => toggleRow(product.productID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="View Details"
                        >
                          <FaEye className="w-4 h-4 text-gray-600" />
                        </button>
                        {canEdit && (
                          <button 
                            onClick={() => navigate(`/product-ingredients/edit/${product.productID}`)}
                            className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            aria-label="Edit product ingredient"
                          >
                            <FaEdit className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === product.productID && (
                    <tr>
                      <td colSpan="3" className="p-4 bg-gray-50">
                        <h4 className="text-lg font-semibold mb-2">Ingredients for {product.productName}</h4>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {product.ingredients.map(ingredient => (
                              <tr key={ingredient.productIngredientID}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ingredient.ingredientName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ingredient.quantity}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ingredient.unitName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      ingredient.status
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {ingredient.status ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    {canDelete && (
                                      <button
                                        onClick={() => handleDelete(ingredient.productIngredientID)}
                                        className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                                        aria-label="Delete product ingredient"
                                      >
                                        <FaTrash className="w-4 h-4 text-red-600" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">No product ingredients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <ProfessionalPagination
          count={totalProductIngredients}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
};

export default ProductIngredientList;
