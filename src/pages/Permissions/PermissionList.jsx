import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import PermissionAdd from './PermissionAdd.jsx';
import { toast } from 'react-toastify';
import { getAllPermissions, deletePermission } from '../../services/permissionService.js';
import { hasPermission } from '../../utils/permissionUtils';
import ProfessionalPagination from '../../components/ProfessionalPagination';

export default function PermissionList() {
  const [permissions, setPermissions] = useState([]);
  const [totalPermissions, setTotalPermissions] = useState(0);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('PermissionName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);

  const canCreatePermission = hasPermission('PERMISSION_CREATE');
  const canUpdatePermission = hasPermission('PERMISSION_UPDATE');
  const canDeletePermission = hasPermission('PERMISSION_DELETE');

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        pageNumber: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchTerm,
        sortColumn: sortField,
        sortDirection: sortDirection,
      };
      const response = await getAllPermissions(params);
      if (response.data.isSuccess) {
        setPermissions(response.data.data.items);
        setTotalPermissions(response.data.data.totalRecords || 0);
      } else {
        toast.error(response.data.message || 'Failed to fetch permissions');
        setPermissions([]);
        setTotalPermissions(0);
      }
    } catch (error) {
      toast.error('An error occurred while fetching permissions.');
      console.error(error);
      setPermissions([]);
      setTotalPermissions(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

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

  const handleEdit = (permissionId) => {
    if (!canUpdatePermission) {
      toast.error('You do not have permission to edit permissions.');
      return;
    }
    const permissionToEdit = permissions.find(perm => perm.id === permissionId);
    if (permissionToEdit) {
      setSelectedPermission(permissionToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    if (!canDeletePermission) {
      toast.error('You do not have permission to delete permissions.');
      return;
    }
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this permission?</span>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await deletePermission(id);
                  if (response.isSuccess) {
                    toast.success('Permission deleted successfully');
                  } else {
                    toast.error(response.message || 'Failed to delete permission');
                  }
                } catch (error) {
                  if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message);
                  } else {
                    toast.error('An error occurred while deleting the permission.');
                  }
                  console.error(error);
                } finally {
                  fetchPermissions();
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

  const handleSave = () => {
    setIsEditModalOpen(false);
    fetchPermissions();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-2xl font-semibold">Permission List</h2>
        {canCreatePermission && (
          <button
            onClick={() => {
              setSelectedPermission(null);
              setIsEditModalOpen(true);
            }}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add Permission
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search permissions..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchChange}
            disabled={isLoading}
          />
          <svg className="w-5 h-5 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {isLoading ? (
        <p>Loading permissions...</p>
      ) : permissions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                  onClick={() => handleSort('PermissionName')}
                >
                  <div className="flex items-center">
                    Permission Name
                    {sortField === 'PermissionName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                  onClick={() => handleSort('PermissionKey')}
                >
                  <div className="flex items-center">
                    Permission Key
                    {sortField === 'PermissionKey' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                  onClick={() => handleSort('ControllerName')}
                >
                  <div className="flex items-center">
                    Controller Name
                    {sortField === 'ControllerName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                  onClick={() => handleSort('ActionName')}
                >
                  <div className="flex items-center">
                    Action Name
                    {sortField === 'ActionName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className={`px-4 py-3 text-left text-sm font-semibold text-gray-900 ${!isLoading && 'cursor-pointer'}`}
                  onClick={() => handleSort('ModuleName')}
                >
                  <div className="flex items-center">
                    Module Name
                    {sortField === 'ModuleName' && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission, idx) => (
                <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{permission.permissionName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{permission.permissionKey}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{permission.controllerName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{permission.actionName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{permission.moduleName}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="flex space-x-2">
                      {canUpdatePermission && (
                        <button
                          onClick={() => handleEdit(permission.id)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit permission"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                          </svg>
                        </button>
                      )}
                      {canDeletePermission && (
                        <button
                          onClick={() => handleDelete(permission.id)}
                          className="p-1 border border-gray-300 rounded-md hover:bg-red-100 transition-colors"
                          aria-label="Delete permission"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-4">No permissions found.</p>
      )}

      {!isLoading && (
        <ProfessionalPagination
          count={totalPermissions}
          page={currentPage}
          rowsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 sm:mx-auto p-6 animate-scale-in relative">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedPermission ? 'Edit Permission' : 'Add Permission'}</h3>
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
            <div className="max-h-[70vh] overflow-y-auto">
              <PermissionAdd
                isEdit={!!selectedPermission}
                permissionData={selectedPermission}
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
