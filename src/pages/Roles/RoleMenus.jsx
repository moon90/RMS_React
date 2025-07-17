import React, { useState, useEffect } from 'react';
import Pagination from '../../components/Pagination';
import axios from '../../utils/axios';
import { FaTrash } from 'react-icons/fa';
import FormCard from '../../components/FormCard';

const RoleMenus = () => {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [roleMenus, setRoleMenus] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedMenu, setSelectedMenu] = useState('');
  const [sortingOrder, setSortingOrder] = useState('');
  const [permissions, setPermissions] = useState({
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, menusRes] = await Promise.all([
          axios.get('/api/roles'),
          axios.get('/api/menus')
        ]);
        setRoles(rolesRes.data);
        setMenus(menusRes.data);
      } catch (err) {
        console.error('Role/Menu fetch error:', err);
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      const fetchRoleMenus = async () => {
        try {
          const res = await axios.get(`/api/rolemenus?roleId=${selectedRole}`);
          setRoleMenus(res.data);
        } catch (err) {
          console.error('Role menus fetch error:', err);
          setError('Failed to load role menus');
        }
      };
      fetchRoleMenus();
    }
  }, [selectedRole]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPermissions(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/rolemenus', {
        RoleID: selectedRole,
        MenuID: selectedMenu,
        CanView: permissions.canView,
        CanAdd: permissions.canAdd,
        CanEdit: permissions.canEdit,
        CanDelete: permissions.canDelete,
        SortingOrder: sortingOrder
      });
      setRoleMenus([...roleMenus, res.data]);
      setSelectedMenu('');
      setSortingOrder('');
      setPermissions({ canView: false, canAdd: false, canEdit: false, canDelete: false });
    } catch (err) {
      console.error('Menu assignment error:', err);
      setError('Menu assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/rolemenus/${id}`);
      setRoleMenus(roleMenus.filter(rm => rm.Id !== id));
    } catch (err) {
      console.error('Menu removal error:', err);
      setError('Menu removal failed');
    }
  };

  return (
    <div className="p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <FormCard title="Assign New Menu">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.Id} value={role.Id}>{role.Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Menu</label>
            <select
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              required
            >
              <option value="">Select Menu</option>
              {menus.map(menu => (
                <option key={menu.Id} value={menu.Id}>{menu.Name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="canView" checked={permissions.canView} onChange={handleCheckboxChange} />
              <span>Can View</span>
            </label>

            <label className="flex items-center space-x-2">
              <input type="checkbox" name="canAdd" checked={permissions.canAdd} onChange={handleCheckboxChange} />
              <span>Can Add</span>
            </label>

            <label className="flex items-center space-x-2">
              <input type="checkbox" name="canEdit" checked={permissions.canEdit} onChange={handleCheckboxChange} />
              <span>Can Edit</span>
            </label>

            <label className="flex items-center space-x-2">
              <input type="checkbox" name="canDelete" checked={permissions.canDelete} onChange={handleCheckboxChange} />
              <span>Can Delete</span>
            </label>
          </div>

          <div>
            <label className="block mb-1">Sorting Order (Optional)</label>
            <input
              type="number"
              value={sortingOrder}
              onChange={(e) => setSortingOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedRole || !selectedMenu}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Menu'}
          </button>
        </form>
      </FormCard>

      <FormCard title="Assigned Menus">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">View</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Add</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delete</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roleMenus.map(rm => (
                <tr key={rm.Id}>
                  <td className="px-6 py-4">{rm.Menu?.Name || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">{rm.CanView ? '✔️' : '❌'}</td>
                  <td className="px-6 py-4 text-center">{rm.CanAdd ? '✔️' : '❌'}</td>
                  <td className="px-6 py-4 text-center">{rm.CanEdit ? '✔️' : '❌'}</td>
                  <td className="px-6 py-4 text-center">{rm.CanDelete ? '✔️' : '❌'}</td>
                  <td className="px-6 py-4">{rm.SortingOrder}</td>
                  <td className="px-6 py-4">{new Date(rm.AssignedAt).toLocaleString()}</td>
                  <td className="px-6 py-4">{rm.AssignedBy}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(rm.Id)} className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}

              {roleMenus.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No menus assigned to this role yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={roleMenus.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </FormCard>
    </div>
  );
};

export default RoleMenus;
