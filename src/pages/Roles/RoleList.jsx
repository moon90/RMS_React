import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import RoleAdd from './RoleAdd';
import { toast } from 'react-toastify';
import { getAllRoles, deleteRole, toggleRoleStatus } from '../../services/userRoleManagementService.js';
import { hasPermission } from '../../utils/permissionUtils';

export default function RoleList() {
  const [roles, setRoles] = useState([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('RoleName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    status: '',
    permission: ''
  });
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const canCreateRole = hasPermission('ROLE_CREATE');
  const canUpdateRole = hasPermission('ROLE_UPDATE');
  const canDeleteRole = hasPermission('ROLE_DELETE');

  const fetchRoles = useCallback(async () => {
    setIsLoading(true); // Set loading to true
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
      };
      const response = await getAllRoles(params);
      if (response.data) {
        let fetchedRoles = response.data.data.items;
        setRoles(fetchedRoles);
        setTotalRoles(response.data.data.totalRecords || 0);
      } else {
        toast.error('Failed to fetch roles');
        setRoles([]); // Clear roles on error
        setTotalRoles(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching roles.');
      console.error(error);
      setRoles([]); // Clear roles on error
      setTotalRoles(0);
    } finally {
      setIsLoading(false); // Set loading to false
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300), []);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handleSort = (field) => {
    if (isLoading) return; // Prevent sorting while loading
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilter = (e) => {
    if (isLoading) return; // Prevent filtering while loading
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };
  
  const handleEdit = (roleId) => {
    if (!canUpdateRole) {
      toast.error('You do not have permission to edit roles.');
      return;
    }
    const roleToEdit = roles.find(role => role.roleID === roleId);
    if (roleToEdit) {
      setSelectedRole(roleToEdit);
      setIsEditModalOpen(true);
    }
  };
  
  const handleDelete = (id) => {
    if (!canDeleteRole) {
      toast.error('You do not have permission to delete roles.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this role?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deleteRole(id);
                  if (response.data.isSuccess) {
                    toast.success('Role deleted successfully');
                  } else {
                    // Display specific error message from backend
                    toast.error(response.data.message || 'Failed to delete role');
                  }
                } catch (error) {
                  // Handle network errors or unexpected exceptions
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the role.');
                  }
                  console.error(error);
                } finally {
                  fetchRoles(); // Always refresh the list after a delete attempt
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
    if (!canUpdateRole) {
      toast.error('You do not have permission to change role status.');
      return;
    }

    const newStatus = !currentStatus;
    const actionText = newStatus ? 'activate' : 'deactivate';

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">
            Are you sure you want to {actionText} this role?
          </span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await toggleRoleStatus(id, newStatus);
                  if (response.data.isSuccess) {
                    toast.success(`Role ${actionText}d successfully`);
                    fetchRoles();
                  } else {
                    toast.error(response.data.message || `Failed to ${actionText} role`);
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error(`An error occurred while trying to ${actionText} the role.`);
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

  const handleSave = () => {
    setIsEditModalOpen(false);
    fetchRoles();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold">Role List</h2>
            {canCreateRole && (
              <button
                  onClick={() => {
                  setSelectedRole(null);
                  setIsEditModalOpen(true);
                  }}
                  className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                  Add Role
              </button>
            )}
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search roles..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchChange}
            disabled={isLoading}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        
        <select 
          name="status" 
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={handleFilter}
          value={filters.status}
          disabled={isLoading}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        
        {/* Permissions filter (if applicable) */}
        {/* <select 
          name="permission" 
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={handleFilter}
          value={filters.permission}
          disabled={isLoading}
        >
          <option value="">All Permissions</option>
          <option value="All">All</option>
          <option value="Edit">Edit</option>
          <option value="View">View</option>
        </select> */}
      </div>
      
      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
              <th 
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('RoleName')}
              >
                <div className="flex items-center">
                  Role Name
                  {sortField === 'RoleName' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('Description')}
              >
                <div className="flex items-center">
                  Description
                  {sortField === 'Description' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                onClick={() => handleSort('CreatedDate')}
              >
                <div className="flex items-center">
                  Created Date
                  {sortField === 'CreatedDate' && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">Loading...</td>
              </tr>
            ) : roles.length > 0 ? (
              roles.map((role, idx) => (
                <tr key={role.roleID} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{role.roleName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{role.description}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{new Date(role.createdDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      role.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {role.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex space-x-2">
                      {canUpdateRole && (
                        <button 
                          onClick={() => handleEdit(role.roleID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit role"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                          </svg>
                        </button>
                      )}
                      {canUpdateRole && (
                        <button
                          onClick={() => handleToggleStatus(role.roleID, role.status)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Toggle active status"
                        >
                          {role.status ? (
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
                      {canDeleteRole && (
                        <button 
                          onClick={() => handleDelete(role.roleID)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete role"
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
                <td colSpan="6" className="text-center py-4">No roles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{totalRoles === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {totalRoles === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalRoles)}
            </span> of <span className="font-medium">{totalRoles}</span> entries
          </span>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-sm text-gray-700">Items per page:</label>
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
            {Array.from({ length: Math.ceil(totalRoles / itemsPerPage) }, (_, i) => (
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalRoles / itemsPerPage)))}
            disabled={currentPage === Math.ceil(totalRoles / itemsPerPage) || isLoading}
            className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 sm:mx-auto p-6 animate-scale-in relative">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{selectedRole ? 'Edit Role' : 'Add Role'}</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-red-500 transition"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[70vh] overflow-y-auto">
                <RoleAdd
                  isEdit={!!selectedRole}
                  roleData={selectedRole}
                  onSave={handleSave}
                  onClose={() => setIsEditModalOpen(false)}
                  showTitle={false}
                />
              </div>
            </div>
          </div>
        )}

    </div>
  );
}