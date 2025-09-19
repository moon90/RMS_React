import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllCustomers, deleteCustomer, toggleCustomerStatus } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('customerName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canView = user?.permissions?.includes('CUSTOMER_VIEW');
  const canCreate = user?.permissions?.includes('CUSTOMER_CREATE');
  const canEdit = user?.permissions?.includes('CUSTOMER_UPDATE');
  const canDelete = user?.permissions?.includes('CUSTOMER_DELETE');

  const fetchCustomers = useCallback(async () => {
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
      const response = await getAllCustomers(params);
      if (response.data.isSuccess) {
        setCustomers(response.data.data.items);
        setTotalCustomers(response.data.data.totalRecords || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch customers');
        setCustomers([]);
        setTotalCustomers(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching customers.');
      console.error(error);
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    fetchCustomers();
  }, [canView, navigate, fetchCustomers]);

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

  const handleDelete = (id) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete customers.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this customer?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteCustomer(id);
                  if (response.data.isSuccess) {
                    toast.success('Customer deleted successfully');
                  } else {
                    toast.error(response.data.message || 'Failed to delete customer');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the customer.');
                  }
                  console.error(error);
                } finally {
                  fetchCustomers();
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
      toast.error('You do not have permission to change the status of a customer.');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">
            Are you sure you want to {actionText} this customer?
          </span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await toggleCustomerStatus(id, newStatus);
                  if (response.data.isSuccess) {
                    toast.success(`Customer ${actionText}d successfully`);
                    fetchCustomers();
                  } else {
                    toast.error(response.data.message || `Failed to ${actionText} customer`);
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error(`An error occurred while trying to ${actionText} the customer.`);
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
        <h2 className="text-2xl font-semibold">Customer List</h2>
        {canCreate && (
          <button
            onClick={() => navigate('/customers/add')}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add Customer
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
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
                onClick={() => handleSort('customerName')}
              >
                <div className="flex items-center">
                  Customer Name
                  {sortField === 'customerName' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Address</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Driver Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">Loading...</td>
              </tr>
            ) : customers.length > 0 ? (
              customers.map((customer, idx) => (
                <tr key={customer.customerID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{customer.customerName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{customer.customerPhone}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{customer.customerEmail}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{customer.address}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{customer.driverName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {customer.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button 
                          onClick={() => navigate(`/customers/edit/${customer.customerID}`)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit customer"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                          </svg>
                        </button>
                      )}
                      {canEdit && (
                        <button 
                          onClick={() => handleToggleStatus(customer.customerID, customer.status)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Toggle active status"
                        >
                          {customer.status ? ( // Change icon based on active status
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
                          onClick={() => handleDelete(customer.customerID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete customer"
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
                <td colSpan="8" className="text-center py-4">No customers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{totalCustomers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {totalCustomers === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalCustomers)}
            </span> of <span className="font-medium">{totalCustomers}</span> entries
          </span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-sm text-gray-700">Items per page:</label>
          <select
            className="p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            disabled={isLoading}
          >
            {[5, 10, 25, 50].map(number => (
              <option key={number} value={number}>{number}</option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="mx-2 flex items-center">
            {Array.from({ length: Math.ceil(totalCustomers / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`mx-1 px-3 py-1 text-sm rounded-md ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                disabled={isLoading}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCustomers / itemsPerPage)))}
            disabled={currentPage === Math.ceil(totalCustomers / itemsPerPage) || isLoading}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
