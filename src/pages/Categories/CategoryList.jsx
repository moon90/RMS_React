import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllCategories, deleteCategory, toggleCategoryStatus, exportCategories, importCategories } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import ProfessionalPagination from '../../components/ProfessionalPagination';
import { toast } from 'react-toastify';
import showCustomConfirmAlert from '../../components/CustomConfirmAlert';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('CategoryName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canView = user?.permissions?.includes('CATEGORY_VIEW');
  const canCreate = user?.permissions?.includes('CATEGORY_CREATE');
  const canEdit = user?.permissions?.includes('CATEGORY_UPDATE');
  const canDelete = user?.permissions?.includes('CATEGORY_DELETE');
  // const canExport = true; // Temporarily set to true for debugging
  // const canImport = true; // Temporarily set to true for debugging
  const canExport = user?.permissions?.includes('CATEGORY_EXPORT');
 const canImport = user?.permissions?.includes('CATEGORY_IMPORT');

  console.log('statusFilter before fetchCategories:', statusFilter);
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: statusFilter === '' ? null : statusFilter === 'true',
      };
      const response = await getAllCategories(params);
      if (response.data.isSuccess) {
        setCategories(response.data.data.items);
        setTotalCategories(response.data.data.totalRecords || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch categories');
        setCategories([]);
        setTotalCategories(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching categories.');
      console.error(error);
      setCategories([]);
      setTotalCategories(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    fetchCategories();
  }, [canView, navigate, fetchCategories]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 2000), []);

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    debouncedSearch(value);
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

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canEdit) {
      toast.error('You do not have permission to change the status of a category.');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';

    const handleConfirm = async () => {
      try {
        const response = await toggleCategoryStatus(id, newStatus);
        if (response.data.isSuccess) {
          toast.success(`Category ${actionText}d successfully`);
          fetchCategories();
        } else {
          toast.error(response.data.message || `Failed to ${actionText} category`);
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(`An error occurred while trying to ${actionText} the category.`);
        }
        console.error(error);
      }
    };

    showCustomConfirmAlert({
      title: `Confirm to ${actionText}`,
      message: `Are you sure you want to ${actionText} this category?`,
      onConfirm: handleConfirm,
    });
  };



// ... (rest of the component up to handleDelete)

  const handleExport = async () => {
    if (!canExport) {
      toast.error('You do not have permission to export categories.');
      return;
    }
    setIsLoading(true);
    try {
      await exportCategories();
      toast.success('Categories exported successfully!');
    } catch (error) {
      toast.error('Failed to export categories.');
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setImportFile(event.target.files[0]);
    setImportErrors([]); // Clear previous errors
  };

  const handleImport = async () => {
    if (!canImport) {
      toast.error('You do not have permission to import categories.');
      return;
    }
    if (!importFile) {
      toast.error('Please select a file to import.');
      return;
    }

    setIsImporting(true);
    setImportErrors([]);

    try {
      const response = await importCategories(importFile);
      if (response.data.isSuccess) {
        toast.success(response.data.message || 'Categories imported successfully!');
        setImportFile(null);
        fetchCategories(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to import categories.');
        if (response.data.validationErrors && response.data.validationErrors.length > 0) {
          setImportErrors(response.data.validationErrors);
        }
      }
    } catch (error) {
      let errorMessage = 'An error occurred during import.';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        if (error.response.data.validationErrors) {
          setImportErrors(error.response.data.validationErrors);
        }
      }
      toast.error(errorMessage);
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

// ... (rest of the component up to handleDelete)


  const handleDelete = (id) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete categories.');
      return;
    }

    const handleConfirm = async () => {
      try {
        const response = await deleteCategory(id);
        if (response.data.isSuccess) {
          toast.success('Category deleted successfully');
          fetchCategories(); // Refresh the list
        } else {
          toast.error(response.data.message || 'Failed to delete category');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred while deleting the category.';
        toast.error(errorMessage);
        console.error(error);
      }
    };

    showCustomConfirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this category?',
      onConfirm: handleConfirm,
    });
  };

// ... (rest of the component)

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Category List</h2>
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
          {canExport && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H5a2 2 0 01-2-2V6a2 2 0 012-2h7l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2z"></path>
              </svg>
              Export
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => navigate('/categories/add')}
              className="px-4 py-2 bg-[#E65100] text-white rounded-md hover:bg-[#D84315] transition flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Import Section */}
      {canImport && (
        <div className="mb-6 p-4 border border-gray-300 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Import Categories (CSV)</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-orange-50 file:text-[#E65100]
              hover:file:bg-orange-100"
              disabled={isImporting}
            />
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center w-full sm:w-auto"
              disabled={isImporting || !importFile}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              {isImporting ? 'Importing...' : 'Import'}
            </button>
          </div>
          {importErrors.length > 0 && (
            <div className="mt-4 text-red-600 text-sm">
              <p className="font-semibold">Import Errors:</p>
              <ul className="list-disc pl-5">
                {importErrors.map((error, index) => (
                  <li key={index}>
                    Row {error.rowNumber || 'N/A'}: {error.propertyName} - {error.errorMessage}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E65100] focus:border-[#E65100]"
            value={inputValue}
            onChange={handleSearchChange}
            disabled={isLoading}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div className="relative">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E65100] focus:border-[#E65100]"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
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
          <thead className="bg-[#F5F5F5]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">#</th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('CategoryName')}
              >
                <div className="flex items-center">
                  Category Name
                  {sortField === 'CategoryName' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Loading...</td>
              </tr>
            ) : categories.length > 0 ? (
              categories.map((category, idx) => (
                <tr key={category.categoryID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-[#424242]">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{category.categoryName}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#424242]">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button 
                          onClick={() => navigate(`/categories/edit/${category.categoryID}`)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit category"
                        >
                          <svg className="w-4 h-4 text-[#E65100]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                          </svg>
                        </button>
                      )}
                      {canEdit && (
                        <button 
                          onClick={() => handleToggleStatus(category.categoryID, category.status)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Toggle active status"
                        >
                          {category.status ? ( // Change icon based on active status
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
                          onClick={() => handleDelete(category.categoryID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete category"
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
                <td colSpan="4" className="text-center py-4">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && (
        <ProfessionalPagination
          count={totalCategories}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </div>
  );
};

export default CategoryList;