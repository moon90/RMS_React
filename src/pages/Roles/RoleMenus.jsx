import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axios';
import { FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { assignMenusToRoleBulk, unassignMenusFromRoleBulk, assignMenuToRole } from '../../services/menuService';

const FormCard = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg p-6 mb-6">
    <h2 className="text-xl font-bold mb-4 text-gray-700">{title}</h2>
    {children}
  </div>
);

const AssignedMenusTable = ({ roleMenus, onDelete, onSelect, selectedMenus, onPermissionChange }) => (
  <FormCard title="Assigned Menus">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              <input
                type="checkbox"
                onChange={(e) => {
                  const allMenuIds = roleMenus.map(rm => rm.menuID);
                  if (e.target.checked) {
                    onSelect(allMenuIds, 'add');
                  } else {
                    onSelect(allMenuIds, 'remove');
                  }
                }}
                checked={roleMenus.length > 0 && roleMenus.every(rm => selectedMenus.includes(rm.menuID))}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Can View</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Can Add</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Can Edit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Can Delete</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {roleMenus.map(rm => (
            <tr key={rm.roleMenuID}>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedMenus.includes(rm.menuID)}
                  onChange={() => onSelect([rm.menuID], selectedMenus.includes(rm.menuID) ? 'remove' : 'add')}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{rm.menuName || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  checked={rm.canView}
                  onChange={(e) => {
                    onPermissionChange(rm.roleMenuID, rm.roleID, rm.menuID, 'canView', e.target.checked);
                  }}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  checked={rm.canAdd}
                  onChange={(e) => onPermissionChange(rm.roleMenuID, rm.roleID, rm.menuID, 'canAdd', e.target.checked)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  checked={rm.canEdit}
                  onChange={(e) => onPermissionChange(rm.roleMenuID, rm.roleID, rm.menuID, 'canEdit', e.target.checked)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  checked={rm.canDelete}
                  onChange={(e) => onPermissionChange(rm.roleMenuID, rm.roleID, rm.menuID, 'canDelete', e.target.checked)}
                />
              </td>
              <td className="px-6 py-4">
                {/* FIX: pass the correct ID property */}
                <button onClick={() => onDelete(rm.roleMenuID)} className="text-red-600 hover:text-red-800 transition-colors duration-200">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          {roleMenus.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                No menus assigned to this role yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </FormCard>
);

const AvailableMenusTable = ({ menus, assignedMenuIds, onSelect, selectedMenus }) => {
  const availableMenus = menus.filter(menu => !assignedMenuIds.includes(menu.menuID));

  return (
    <FormCard title="Available Menus">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const allMenuIds = availableMenus.map(menu => menu.menuID);
                    if (e.target.checked) {
                      onSelect(allMenuIds, 'add');
                    } else {
                      onSelect(allMenuIds, 'remove');
                    }
                  }}
                  checked={availableMenus.length > 0 && availableMenus.every(menu => selectedMenus.includes(menu.menuID))}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Controller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {availableMenus.map(menu => (
              <tr key={menu.menuID}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedMenus.includes(menu.menuID)}
                    onChange={() => onSelect([menu.menuID], selectedMenus.includes(menu.menuID) ? 'remove' : 'add')}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{menu.menuName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{menu.controllerName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{menu.actionName}</td>
              </tr>
            ))}
            {availableMenus.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No available menus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </FormCard>
  );
};

const RoleMenus = () => {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [roleMenus, setRoleMenus] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAssignedMenus, setSelectedAssignedMenus] = useState([]);
  const [selectedAvailableMenus, setSelectedAvailableMenus] = useState([]);

  const fetchRolesAndMenus = useCallback(async () => {
    try {
      const [rolesRes, menusRes] = await Promise.all([
        axios.get('/Roles?pageSize=1000'),
        axios.get('/Menus?pageSize=1000')
      ]);
      const normalizeToArray = (res) => {
        const d = res?.data ?? res;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data?.items)) return d.data.items;
        if (Array.isArray(d?.items)) return d.items;
        if (Array.isArray(d?.data)) return d.data;
        if (d && !Array.isArray(d)) return [d];
        return [];
      };

      setRoles(normalizeToArray(rolesRes));
      setMenus(normalizeToArray(menusRes));
    } catch (err) {
      toast.error('Failed to load roles and menus.');
      console.error('Role/Menu fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchRolesAndMenus();
  }, [fetchRolesAndMenus]);

  const fetchRoleMenus = useCallback(async (roleId) => {
    if (!roleId) {
      setRoleMenus([]);
      return;
    }
    try {
      const res = await axios.get(`/Menus/role/${roleId}`);
      const rawMenus = res.data?.data || [];

      // 🔑 Normalize keys so the rest of the code is consistent
      const normalized = rawMenus.map(rm => ({
        roleMenuID: rm.roleMenuID ?? rm.RoleMenuID,
        roleID: rm.roleID ?? rm.RoleID,
        menuID: rm.menuID ?? rm.MenuID,
        menuName: rm.menuName ?? rm.MenuName,
        canView: rm.canView ?? rm.CanView,
        canAdd: rm.canAdd ?? rm.CanAdd,
        canEdit: rm.canEdit ?? rm.CanEdit,
        canDelete: rm.canDelete ?? rm.CanDelete,
      }));

      setRoleMenus(normalized);
      setSelectedAssignedMenus([]); // Clear selections on role change
      setSelectedAvailableMenus([]); // Clear selections on role change
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load assigned menus.');
        console.error('Role menus fetch error:', err);
      }
      setRoleMenus([]);
      setSelectedAssignedMenus([]);
      setSelectedAvailableMenus([]);
    }
  }, []);

  useEffect(() => {
    fetchRoleMenus(selectedRole);
  }, [selectedRole, fetchRoleMenus]);

  const handleAssignedMenuSelect = (menuIds, action) => {
    setSelectedAssignedMenus(prev => {
      if (action === 'add') {
        return [...new Set([...prev, ...menuIds])];
      } else {
        return prev.filter(id => !menuIds.includes(id));
      }
    });
  };

  const handleAvailableMenuSelect = (menuIds, action) => {
    setSelectedAvailableMenus(prev => {
      if (action === 'add') {
        return [...new Set([...prev, ...menuIds])];
      } else {
        return prev.filter(id => !menuIds.includes(id));
      }
    });
  };

  const handleAssignSelectedMenus = useCallback(async () => {
    if (!selectedRole || selectedAvailableMenus.length === 0) {
      toast.warn('Please select a role and at least one available menu to assign.');
      return;
    }
    setLoading(true);
    try {
      const res = await assignMenusToRoleBulk(selectedRole, selectedAvailableMenus);
      if (res.data.isSuccess) {
        toast.success('Selected menus assigned successfully!');
        fetchRoleMenus(selectedRole); // Re-fetch to get the latest list
        setSelectedAvailableMenus([]); // Clear selections after assignment
      } else {
        toast.error(res.data.message || 'Bulk menu assignment failed.');
      }
    } catch (err) {
      toast.error('An error occurred during bulk menu assignment.');
      console.error('Bulk menu assignment error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedAvailableMenus, fetchRoleMenus]);

  // ✅ FIXED: consistent use of `roleMenuID` + safer payload build from the updated row
const handlePermissionChange = useCallback(
  async (roleMenuID, roleID, menuID, permissionType, value) => {
    setLoading(true);
    try {
      // 1) Compute the updated row from the CURRENT state (before set)
      const currentRow = roleMenus.find(rm => rm.roleMenuID === roleMenuID);
      if (!currentRow) {
        toast.error('Error: Role menu not found for update.');
        setLoading(false);
        return;
      }

      const updatedRowLocal = { ...currentRow, [permissionType]: value };

      // 2) Optimistically update state using the local updated row
      setRoleMenus(prev =>
        prev.map(rm => (rm.roleMenuID === roleMenuID ? updatedRowLocal : rm))
      );

      // 3) Send EXACTLY what you intend to save
      const payload = {
        roleMenuID: updatedRowLocal.roleMenuID,
        roleID,
        menuID,
        canView: !!updatedRowLocal.canView,
        canAdd: !!updatedRowLocal.canAdd,
        canEdit: !!updatedRowLocal.canEdit,
        canDelete: !!updatedRowLocal.canDelete,
      };

      const res = await assignMenuToRole(roleID, menuID, payload);

      if (res.data?.isSuccess) {
        toast.success('Permission updated successfully!');
      } else {
        toast.error(res.data?.message || 'Permission update failed.');
        // Revert on failure
        setRoleMenus(prev =>
          prev.map(rm =>
            rm.roleMenuID === roleMenuID ? { ...rm, [permissionType]: !value } : rm
          )
        );
      }
    } catch (err) {
      toast.error('An error occurred while updating permission.');
      console.error('Permission update error:', err);
      // Revert on error
      setRoleMenus(prev =>
        prev.map(rm =>
          rm.roleMenuID === roleMenuID ? { ...rm, [permissionType]: !value } : rm
        )
      );
    } finally {
      setLoading(false);
    }
  },
  [roleMenus]
);

  const handleUnassignSelectedMenus = useCallback(async () => {
    if (!selectedRole || selectedAssignedMenus.length === 0) {
      toast.warn('Please select a role and at least one assigned menu to unassign.');
      return;
    }
    setLoading(true);
    try {
      const res = await unassignMenusFromRoleBulk(selectedRole, selectedAssignedMenus);
      if (res.data.isSuccess) {
        toast.success('Selected menus unassigned successfully!');
        fetchRoleMenus(selectedRole); // Re-fetch to get the latest list
      } else {
        toast.error(res.data.message || 'Bulk menu unassignment failed.');
      }
    } catch (err) {
      toast.error('An error occurred during bulk menu unassignment.');
      console.error('Bulk menu unassignment error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedAssignedMenus, fetchRoleMenus]);

  // ✅ FIXED: use the correct key for finding + deletion
  const handleDeleteRoleMenu = useCallback(async (roleMenuId) => {
    const roleMenuToDelete = roleMenus.find(rm => rm.roleMenuID === roleMenuId);
    if (!roleMenuToDelete) {
      toast.error('Cannot find the assigned menu to delete.');
      return;
    }

    setLoading(true);
    try {
      // Using bulk unassign endpoint for single unassignment
      const response = await unassignMenusFromRoleBulk(roleMenuToDelete.roleID, [roleMenuToDelete.menuID]);
      if (response.data.isSuccess) {
        toast.success('Menu unassigned successfully!');
        fetchRoleMenus(selectedRole); // Re-fetch to get the latest list
      } else {
        toast.error(response.data.message || 'Menu unassignment failed.');
      }
    } catch (err) {
      toast.error('An error occurred during menu unassignment.');
      console.error('Menu removal error:', err);
    } finally {
      setLoading(false);
    }
  }, [roleMenus, selectedRole, fetchRoleMenus]);

  const assignedMenuIds = roleMenus.map(rm => rm.menuID);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <FormCard title="Assign New Menu">
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-gray-600">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.roleID} value={role.roleID}>{role.roleName}</option>
                  ))}
                </select>
              </div>
              <AvailableMenusTable
                menus={menus}
                assignedMenuIds={assignedMenuIds}
                onSelect={handleAvailableMenuSelect}
                selectedMenus={selectedAvailableMenus}
              />
              <button
                onClick={handleAssignSelectedMenus}
                disabled={loading || !selectedRole || selectedAvailableMenus.length === 0}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-300"
              >
                {loading ? 'Assigning...' : 'Assign Selected Menus'}
              </button>
            </div>
          </FormCard>
        </div>
        <div className="md:col-span-2">
          <AssignedMenusTable
            roleMenus={roleMenus}
            onDelete={handleDeleteRoleMenu}
            onSelect={handleAssignedMenuSelect}
            selectedMenus={selectedAssignedMenus}
            onPermissionChange={handlePermissionChange}
          />
          <button
            onClick={handleUnassignSelectedMenus}
            disabled={loading || !selectedRole || selectedAssignedMenus.length === 0}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-300 mt-4"
          >
            {loading ? 'Unassigning...' : 'Unassign Selected Menus'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleMenus;
