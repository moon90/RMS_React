import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import menuService from '../../services/menuService';
import { fetchRoles } from '../../services/userRoleManagementService';
import { useAuth } from '../../context/AuthContext';
import {
  FaCompass,
  FaShieldAlt,
  FaPlus,
  FaChevronRight,
  FaTrash,
  FaLayerGroup,
  FaCheckCircle,
  FaCircle,
  FaArrowRight,
  FaUniversalAccess
} from 'react-icons/fa';

const RoleMenus = () => {
  const { refreshPermissions } = useAuth();
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [roleMenus, setRoleMenus] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAvailableMenus, setSelectedAvailableMenus] = useState([]);

  const fetchBaseData = useCallback(async () => {
    try {
      const [rolesRes, menusRes] = await Promise.all([
        fetchRoles(1, 1000),
        menuService.getAllMenus({ pageNumber: 1, pageSize: 1000 })
      ]);

      // Roles now use ResponseDto<PagedResult> envelope
      const rawRoles = rolesRes.data?.data?.items || rolesRes.data?.data || rolesRes.data || [];
      setRoles(Array.isArray(rawRoles) ? rawRoles : []);

      // Menus now use ResponseDto<PagedResult> envelope: { isSuccess, data: { items: [...], totalRecords } }
      const menusResponseData = menusRes.data?.data;
      const rawMenus = menusResponseData?.items || menusResponseData?.Items ||
        (Array.isArray(menusResponseData) ? menusResponseData : []);

      const normalizedMenus = rawMenus.map(m => ({
        menuID: Number(m.menuID ?? m.MenuID ?? m.id ?? m.Id),
        menuName: m.menuName ?? m.MenuName ?? 'Unnamed Node',
        controllerName: m.controllerName ?? m.ControllerName,
        actionName: m.actionName ?? m.ActionName
      }));
      
      setMenus(normalizedMenus);
    } catch (err) {
      console.error('Core navigation fetch error:', err);
      toast.error('Failed to initialize system navigation data.');
    }
  }, []);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  const fetchRoleMenusData = useCallback(async (roleId) => {
    if (!roleId) {
      setRoleMenus([]);
      return;
    }
    setLoading(true);
    try {
      const res = await menuService.getRoleMenus(roleId);
      const rawData = res.data?.data || res.data || [];
      const items = Array.isArray(rawData) ? rawData : (rawData.items || rawData.Items || []);
      
      const normalized = items.map(rm => ({
        roleMenuID: Number(rm.roleMenuID ?? rm.RoleMenuID ?? rm.id ?? rm.Id),
        roleID: Number(rm.roleID ?? rm.RoleID),
        menuID: Number(rm.menuID ?? rm.MenuID),
        menuName: rm.menuName ?? rm.MenuName ?? 'Unnamed Node',
        canView: rm.canView ?? rm.CanView ?? false,
        canAdd: rm.canAdd ?? rm.CanAdd ?? false,
        canEdit: rm.canEdit ?? rm.CanEdit ?? false,
        canDelete: rm.canDelete ?? rm.CanDelete ?? false,
      }));
      setRoleMenus(normalized);
    } catch (err) {
      console.error('Critical failure during navigation matrix synchronization:', err);
      setRoleMenus([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoleMenusData(selectedRole);
  }, [selectedRole, fetchRoleMenusData]);

  const handleToggleAvailable = (menuId) => {
    setSelectedAvailableMenus(prev =>
      prev.includes(menuId) ? prev.filter(id => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSelectAllAvailable = () => {
    if (selectedAvailableMenus.length === availableMenus.length && availableMenus.length > 0) {
      setSelectedAvailableMenus([]);
    } else {
      setSelectedAvailableMenus(availableMenus.map(m => m.menuID));
    }
  };

  const handleAssignMenus = async () => {
    if (!selectedRole || selectedAvailableMenus.length === 0) return;
    setLoading(true);
    try {
      // Standardize payload to PascalCase for backend DTO compatibility
      const payload = {
        RoleId: Number(selectedRole),
        MenuIds: selectedAvailableMenus.map(id => Number(id)),
        CanView: true,
        CanAdd: true,   // Set to true by default for better UX
        CanEdit: true,  // Set to true by default for better UX
        CanDelete: true // Set to true by default for better UX
      };
      const res = await menuService.assignMenusToRoleBulk(payload.RoleId, payload.MenuIds);
      if (res.data?.isSuccess) {
        toast.success('Navigation privileges expanded with full CRUD access!');
        fetchRoleMenusData(selectedRole);
        setSelectedAvailableMenus([]);
        await refreshPermissions();
      }
    } catch (err) {
      toast.error('Failed to sync navigation data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (rm, type, val) => {
    setLoading(true);
    try {
      const payload = { ...rm, [type]: val };
      const res = await menuService.assignMenuToRole(rm.roleID, rm.menuID, payload);
      if (res.data.isSuccess) {
        setRoleMenus(prev => prev.map(item => item.roleMenuID === rm.roleMenuID ? payload : item));
        toast.success('Access granularities updated.');
        await refreshPermissions();
      }
    } catch (err) {
      toast.error('Failed to update permission state.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (roleMenuId) => {
    const target = roleMenus.find(r => r.roleMenuID === roleMenuId);
    if (!target) return;
    setLoading(true);
    try {
      await menuService.unassignMenusFromRoleBulk(target.roleID, [target.menuID]);
      toast.success('Menu visibility revoked.');
      fetchRoleMenusData(selectedRole);
      await refreshPermissions();
    } catch (err) {
      toast.error('Failed to unassign navigation link.');
    } finally {
      setLoading(false);
    }
  };

  const assignedMenuIds = roleMenus.map(rm => rm.menuID);
  const availableMenus = menus.filter(m => !assignedMenuIds.includes(m.menuID));

  return (
    <div className="container mx-auto p-6 animate-fade-in max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <FaCompass className="text-indigo-600" />
            Menu Assignments
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Map system navigation nodes and CRUD permissions to roles</p>
        </div>

        <div className="relative group">
          <select
            className="appearance-none pl-12 pr-10 py-4 bg-white border-2 border-indigo-100 rounded-2xl font-black text-gray-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer min-w-[300px]"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Select Target Role</option>
            {roles.map(role => (
              <option key={role.roleID} value={role.roleID}>{role.roleName}</option>
            ))}
          </select>
          <FaShieldAlt className="absolute left-4 top-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>

      {!selectedRole ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUniversalAccess className="text-gray-300" size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Navigation Lock</h3>
          <p className="text-gray-400 max-w-md mx-auto mt-2">Select a role to unlock navigation management and CRUD authorization settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* AVAILABLE MENUS PANEL */}
          <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-50">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <FaLayerGroup className="text-indigo-500" /> Available
              </h3>
              <div className="flex items-center gap-2">
                {availableMenus.length > 0 && (
                  <button
                    onClick={handleSelectAllAvailable}
                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all text-gray-500 hover:bg-gray-50 border-gray-200"
                  >
                    {selectedAvailableMenus.length === availableMenus.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
                <span className="bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg text-[10px] font-black">{availableMenus.length}</span>
                <button
                  onClick={() => window.location.href = '/menus/add'}
                  className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Create New Menu Node"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {availableMenus.length > 0 ? availableMenus.map(menu => (
                <div
                  key={menu.menuID}
                  onClick={() => handleToggleAvailable(menu.menuID)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${selectedAvailableMenus.includes(menu.menuID)
                      ? 'bg-indigo-50 border-indigo-100 shadow-sm'
                      : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {selectedAvailableMenus.includes(menu.menuID)
                        ? <FaCheckCircle className="text-indigo-600 text-lg" />
                        : <FaCircle className="text-gray-200 text-lg" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedAvailableMenus.includes(menu.menuID) ? 'text-indigo-900' : 'text-gray-600'}`}>
                      {menu.menuName}
                    </span>
                  </div>
                  <FaChevronRight className="text-gray-200 text-xs" />
                </div>
              )) : (
                <p className="text-center py-10 text-gray-300 italic text-sm">All menus assigned</p>
              )}
            </div>

            <button
              onClick={handleAssignMenus}
              disabled={selectedAvailableMenus.length === 0 || loading}
              className={`w-full mt-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${selectedAvailableMenus.length > 0
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
            >
              {loading ? 'Syncing...' : 'Assign Selected'} <FaArrowRight />
            </button>
          </div>

          {/* ASSIGNED MENUS MATRIX */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <FaShieldAlt className="text-emerald-500" /> Active Navigation Matrix
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-50">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Menu Node</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">View</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Add</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Edit</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Del</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {roleMenus.length > 0 ? roleMenus.map(rm => (
                    <tr key={rm.roleMenuID} className="group hover:bg-gray-50/50 transition-all">
                      <td className="px-6 py-5">
                        <span className="font-black text-gray-700 text-sm">{rm.menuName}</span>
                      </td>
                      {['canView', 'canAdd', 'canEdit', 'canDelete'].map(perm => (
                        <td key={perm} className="px-6 py-5 text-center">
                          <button
                            onClick={() => handlePermissionChange(rm, perm, !rm[perm])}
                            className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition-all ${rm[perm]
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110'
                                : 'bg-gray-100 text-transparent hover:bg-gray-200'
                              }`}
                          >
                            <FaCheckCircle size={12} />
                          </button>
                        </td>
                      ))}
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleUnassign(rm.roleMenuID)}
                          className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-gray-300 font-bold italic">No active navigation nodes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default RoleMenus;
