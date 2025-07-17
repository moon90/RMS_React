import React, { useState, useEffect } from 'react';
import Pagination from '../../components/Pagination';
import axios from '../../utils/axios';
import { FaUsers, FaLock, FaTrash, FaEdit } from 'react-icons/fa';
import FormCard from '../../components/FormCard';
import Card from '../../components/Card';
import Header from '../../components/Header';

const RolePermission = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('');
  const [sortingOrder, setSortingOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          axios.get('/api/roles'),
          axios.get('/api/permissions')
        ]);
        setRoles(rolesRes.data);
        setPermissions(permissionsRes.data);
      } catch (err) {
        console.error('Role/Permission fetch error:', err);
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  // Fetch role permissions when role is selected
  useEffect(() => {
    if (selectedRole) {
      const fetchRolePermissions = async () => {
        try {
          const res = await axios.get(`/api/rolepermissions?roleId=${selectedRole}`);
          setRolePermissions(res.data);
        } catch (err) {
          console.error('Role permissions fetch error:', err);
          setError('Failed to load role permissions');
        }
      };
      fetchRolePermissions();
    }
  }, [selectedRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/rolepermissions', {
        RoleID: selectedRole,
        PermissionID: selectedPermission,
        SortingOrder: sortingOrder
      });
      setRolePermissions([...rolePermissions, res.data]);
      setSelectedPermission('');
      setSortingOrder('');
    } catch (err) {
      console.error('Permission assignment error:', err);
      setError('Permission assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/rolepermissions/${id}`);
      setRolePermissions(rolePermissions.filter(rp => rp.Id !== id));
    } catch (err) {
      console.error('Permission removal error:', err);
      setError('Permission removal failed');
    }
  };

  return (
    <div className="p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <FormCard title="Assign New Permission">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.Id} value={role.Id}>{role.Name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Permission</label>
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Permission</option>
              {permissions.map(perm => (
                <option key={perm.Id} value={perm.Id}>{perm.Name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1">Sorting Order</label>
            <input
              type="number"
              value={sortingOrder}
              onChange={(e) => setSortingOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Optional"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !selectedRole || !selectedPermission}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Permission'}
          </button>
        </form>
      </FormCard>
      
      <FormCard title="Current Permissions">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rolePermissions.map(rp => (
                <tr key={rp.Id}>
                  <td className="px-6 py-4 whitespace-nowrap">{rp.Permission?.Name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{rp.SortingOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(rp.AssignedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{rp.AssignedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(rp.Id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              
              {rolePermissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No permissions assigned to this role yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={rolePermissions.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </FormCard>
    
    </div>
  );
};

export default RolePermission;
