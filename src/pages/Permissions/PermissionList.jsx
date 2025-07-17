import React, { useState } from 'react';
import PermissionAdd from './PermissionAdd.jsx'; // Ensure this file exists
import { toast } from 'react-toastify';

const PermissionList = () => {
  const [permissions, setPermissions] = useState([
    {
      id: 1,
      permissionName: 'View Dashboard',
      permissionKey: 'Dashboard.View',
      controllerName: 'Dashboard',
      actionName: 'Index',
      moduleName: 'Admin',
      status: true,
    },
    {
      id: 2,
      permissionName: 'Edit User',
      permissionKey: 'User.Edit',
      controllerName: 'User',
      actionName: 'Edit',
      moduleName: 'Admin',
      status: true,
    },
    {
      id: 3,
      permissionName: 'Delete Post',
      permissionKey: 'Post.Delete',
      controllerName: 'Post',
      actionName: 'Delete',
      moduleName: 'Content',
      status: false,
    }
  ]);

  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('permissionName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (permission) => {
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
  toast(
    ({ closeToast }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800 mb-2">Are you sure you want to delete this permission?</span>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setPermissions(prev => prev.filter(p => p.id !== id));
              toast.dismiss(); // Close confirmation
              toast.success('Permission deleted successfully');
            }}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => closeToast()}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      autoClose: false,
      closeOnClick: true,
      draggable: false
    }
  );
};


  const handleSave = (permission) => {
    if (permission.id) {
      setPermissions(prev =>
        prev.map(p => (p.id === permission.id ? permission : p))
      );
    } else {
      const nextId = permissions.length ? Math.max(...permissions.map(p => p.id)) + 1 : 1;
      setPermissions(prev => [...prev, { ...permission, id: nextId }]);
    }
    setIsEditModalOpen(false);
  };

  const filteredPermissions = permissions.filter(p =>
    Object.values(p).some(val =>
      (val || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedPermissions = [...filteredPermissions].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    return sortDirection === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold">Permission List</h2>
            <button
                onClick={() => {
                setSelectedPermission(null);
                setIsEditModalOpen(true);
                }}
                className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
                Add Permission
            </button>
        </div>

      {/* Search and Add Button */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search permissions..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
              {['Permission', 'Permission Key', 'Controller', 'Action', 'Module', 'Status'].map(field => (
                <th
                  key={field}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort(field)}
                >
                  <div className="flex items-center">
                    {field.replace(/([A-Z])/g, ' $1')}
                    {sortField === field && (
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((perm, idx) => (
              <tr key={perm.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{perm.permissionName}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{perm.permissionKey}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{perm.controllerName || '-'}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{perm.actionName || '-'}</td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {perm.moduleName || '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    perm.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {perm.status ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(perm)}
                      className="p-1 border border-gray-300 rounded-md hover:bg-gray-100"
                      aria-label="Edit"
                    >
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5h-2m-2 0V7a2 2 0 00-2-2H11a2 2 0 00-2 2v5a2 2 0 002 2h5M9 12h1m-1 4h1" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(perm.id)}
                      className="p-1 border border-gray-300 rounded-md hover:bg-red-100"
                      aria-label="Delete"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{Math.min(indexOfFirstItem + 1, filteredPermissions.length)}</span> to{' '}
          <span className="font-medium">{Math.min(indexOfLastItem, filteredPermissions.length)}</span> of{' '}
          <span className="font-medium">{filteredPermissions.length}</span> entries
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm">Items per page:</label>
          <select
            className="p-1 border border-gray-300 rounded-md text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 25, 50].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1 mt-2 md:mt-0">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 text-sm rounded-md ${
                currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-500 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 sm:mx-auto p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedPermission ? 'Edit Permission' : 'Add Permission'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PermissionAdd
                isEdit={!!selectedPermission}
                permissionData={selectedPermission}
                onSave={handleSave}
                onClose={() => setIsEditModalOpen(false)}
                showTitle={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionList;
