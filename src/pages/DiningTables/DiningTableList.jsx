import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getAllDiningTables, deleteDiningTable, updateDiningTableStatus } from '../../services/diningTableService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DiningTableList = () => {
  const [diningTables, setDiningTables] = useState([]);
  const [totalDiningTables, setTotalDiningTables] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('tableID');
  const [sortDirection, setSortDirection] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const canView = user?.permissions?.includes('DINING_TABLE_VIEW');
  const canCreate = user?.permissions?.includes('DINING_TABLE_CREATE');
  const canEdit = user?.permissions?.includes('DINING_TABLE_UPDATE');
  const canDelete = user?.permissions?.includes('DINING_TABLE_DELETE');

  const fetchDiningTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
        status: statusFilter === '' ? null : statusFilter
      };
      const response = await getAllDiningTables(params);
      console.log('Fetch Dining Tables Response:', response);
      if (response.data.isSuccess) {
        setDiningTables(response.data.data.data.items);
        setTotalDiningTables(response.data.data.data.totalRecords || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch dining tables');
        setDiningTables([]);
        setTotalDiningTables(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching dining tables.');
      console.error(error);
      setDiningTables([]);
      setTotalDiningTables(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    if (!canView) {
      navigate('/access-denied');
      return;
    }
    fetchDiningTables();
  }, [canView, navigate, fetchDiningTables]);

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

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canEdit) {
      toast.error('You do not have permission to edit dining tables.');
      return;
    }

    const newStatus = !currentStatus; // Toggle boolean status

    try {
      const response = await updateDiningTableStatus({ tableID: id, status: newStatus }); // Update 'status' boolean
      if (response.data.succeeded) {
        toast.success('Dining table active status updated successfully');
        fetchDiningTables();
      } else {
        toast.error(response.data.message || 'Failed to update dining table active status');
      }
    } catch (error) {
      toast.error('An error occurred while updating the dining table active status.');
      console.error(error);
    }
  };

  const handleDelete = (id) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete dining tables.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this dining table?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteDiningTable(id);
                  if (response.data.isSuccess) {
                    toast.success('Dining table deleted successfully');
                  } else {
                    toast.error(response.data.message || 'Failed to delete dining table');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the dining table.');
                  }
                  console.error(error);
                } finally {
                  fetchDiningTables();
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Dining Table List</h2>
        {canCreate && (
          <button
            onClick={() => navigate('/dining-tables/add')}
            className="mt-4 md:mt-0 px-4 py-2 bg-[#E65100] text-white rounded-md hover:bg-[#D84315] transition"
          >
            Add New Dining Table
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search dining tables..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E65100] focus:border-[#E65100]"
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
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
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
                onClick={() => handleSort('tableID')}
              >
                <div className="flex items-center">
                  Table ID
                  {sortField === 'tableID' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th
                className={`px-4 py-3 text-left text-sm font-semibold text-[#424242] ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('tableName')}
              >
                <div className="flex items-center">
                  Table Name
                  {sortField === 'tableName' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Table Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Active Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[#424242]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Loading...</td>
              </tr>
            ) : Array.isArray(diningTables) && diningTables.length > 0 ? (
              diningTables.map((table, idx) => (
                <tr key={table.tableID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-[#424242]">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{table.tableID}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">{table.tableName}</td>
                  <td className="px-4 py-4 text-sm text-[#424242]">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        table.diningTableStatus === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : table.diningTableStatus === 'Occupied'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {table.diningTableStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#424242]">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        table.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {table.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#424242]">
                    <div className="flex space-x-2">
                      {canEdit && (
                        <button 
                          onClick={() => navigate(`/dining-tables/edit/${table.tableID}`)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit dining table"
                        >
                          <FaEdit className="w-4 h-4 text-[#E65100]" />
                        </button>
                      )}
                      {canEdit && (
                        <button 
                          onClick={() => handleToggleStatus(table.tableID, table.status)} // Pass boolean status
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Toggle active status"
                        >
                          {table.status ? ( // Change icon based on active status
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
                          onClick={() => handleDelete(table.tableID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete dining table"
                        >
                          <FaTrash className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">No dining tables found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-sm text-[#424242]">
            Showing <span className="font-medium">{totalDiningTables === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {totalDiningTables === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalDiningTables)}
            </span> of <span className="font-medium">{totalDiningTables}</span> entries
          </span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-sm text-[#424242]">Items per page:</label>
          <select
            className="p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {Array.from({ length: Math.ceil(totalDiningTables / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`mx-1 px-3 py-1 text-sm rounded-md ${
                  currentPage === i + 1
                    ? 'bg-[#E65100] text-white'
                    : 'border border-gray-300 text-[#424242] hover:bg-gray-100'
                }`}
                disabled={isLoading}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalDiningTables / itemsPerPage)))}
            disabled={currentPage === Math.ceil(totalDiningTables / itemsPerPage) || isLoading}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiningTableList;