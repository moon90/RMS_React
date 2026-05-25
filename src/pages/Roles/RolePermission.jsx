import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchRoles, 
  fetchAllPermissions, 
  getRolePermissions, 
  assignPermissionsToRole, 
  unassignPermissionsFromRole 
} from '../../services/userRoleManagementService';
import { 
  FaUserShield, 
  FaShieldAlt, 
  FaSave, 
  FaCheckSquare, 
  FaSquare, 
  FaLayerGroup, 
  FaSearch,
  FaFingerprint,
  FaChevronRight,
  FaShieldVirus
} from 'react-icons/fa';

const RolePermission = () => {
  const { refreshPermissions } = useAuth();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [groupedPermissions, setGroupedPermissions] = useState({});

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        fetchRoles(1, 1000),
        fetchAllPermissions()
      ]);
      
      const allRoles = rolesRes.data?.data?.items || [];
      setRoles(allRoles);

      const allPerms = permsRes.data?.data?.items || permsRes.data?.data || [];
      setPermissions(allPerms);

      // Group permissions by prefix (e.g., ROLE_VIEW -> Group: ROLE)
      const groups = allPerms.reduce((acc, perm) => {
        const groupName = perm.permissionKey.split('_')[0] || 'GENERAL';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(perm);
        return acc;
      }, {});
      setGroupedPermissions(groups);

    } catch (error) {
      toast.error('Failed to load security matrix data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  const loadRolePermissions = async (role) => {
    if (!role) return;
    setLoading(true);
    try {
      const res = await getRolePermissions(role.roleID || role.roleId);
      if (res.data.isSuccess) {
        setRolePermissions(res.data.data.map(rp => rp.permissionId || rp.permissionID || rp.id));
      } else {
        setRolePermissions([]);
      }
    } catch (error) {
      setRolePermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    loadRolePermissions(role);
  };

  const handleTogglePermission = (permissionId) => {
    setRolePermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = () => {
    const allIds = permissions.map(p => p.id || p.permissionId || p.permissionID);
    if (rolePermissions.length === allIds.length) {
      setRolePermissions([]);
    } else {
      setRolePermissions(allIds);
    }
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const roleId = selectedRole.roleID || selectedRole.roleId;
      
      if (rolePermissions.length > 0) {
        // The backend's AssignPermissionsToRole replaces all existing permissions with the provided list
        await assignPermissionsToRole(roleId, rolePermissions);
      } else {
        // If we want to clear all permissions, AssignPermissionsToRole fails if the array is empty.
        // So we must fetch the existing permissions and unassign them explicitly.
        const currentRes = await getRolePermissions(roleId);
        const initialPermissions = currentRes.data.data?.map(rp => rp.permissionId || rp.permissionID || rp.id) || [];
        if (initialPermissions.length > 0) {
          await unassignPermissionsFromRole(roleId, initialPermissions);
        }
      }

      // Refresh the current user's permissions globally in case they modified their own role
      if (typeof refreshPermissions === 'function') {
        await refreshPermissions();
      }

      toast.success(`Security profile for ${selectedRole.roleName} synchronized!`);
    } catch (error) {
      toast.error('Synchronization failed');
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = roles.filter(r => 
    r.roleName.toLowerCase().includes(roleSearch.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden animate-fade-in gap-6 p-4">
      
      {/* SIDEBAR: Role Selection */}
      <div className="w-80 bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
            <FaUserShield className="text-indigo-600" /> System Roles
          </h2>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Filter roles..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredRoles.map(role => (
            <div 
              key={role.roleID}
              onClick={() => handleRoleSelect(role)}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                selectedRole?.roleID === role.roleID 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-sm">{role.roleName}</span>
                <span className={`text-[10px] font-medium opacity-60 ${selectedRole?.roleID === role.roleID ? 'text-white' : 'text-gray-400'}`}>
                  UID: {role.roleID}
                </span>
              </div>
              <FaChevronRight className={`text-xs opacity-30 ${selectedRole?.roleID === role.roleID ? 'translate-x-1 opacity-100' : ''}`} />
            </div>
          ))}
        </div>
      </div>

      {/* MAIN: Permission Matrix */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {!selectedRole ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-20 opacity-40">
             <FaShieldVirus size={80} className="text-gray-200 mb-6" />
             <h3 className="text-2xl font-black text-gray-400">SELECT A ROLE</h3>
             <p className="text-gray-400 mt-2 max-w-sm">Choose a role from the sidebar to visualize and configure its security permissions matrix.</p>
          </div>
        ) : (
          <>
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div>
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <FaFingerprint className="text-indigo-600" />
                  {selectedRole.roleName} <span className="text-gray-300 text-sm font-medium">/ Security Profile</span>
                </h2>
                <p className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-widest">Toggle atomic permissions for this role</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black shadow-sm hover:bg-gray-200 transition-all"
                >
                  {rolePermissions.length === permissions.length && permissions.length > 0 ? (
                    <><FaCheckSquare className="text-indigo-600" /> Deselect All</>
                  ) : (
                    <><FaSquare className="text-gray-400" /> Select All</>
                  )}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <FaSave />}
                  Sync Matrix
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                   <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
                   <p className="text-gray-400 font-bold mt-4 animate-pulse uppercase tracking-widest text-xs">Decoding Privileges...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.keys(groupedPermissions).map(groupName => (
                    <div key={groupName} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col group transition-all hover:border-indigo-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <FaLayerGroup size={18} />
                        </div>
                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">{groupName}</h4>
                      </div>

                      <div className="space-y-2">
                        {groupedPermissions[groupName].map(perm => {
                          const pId = perm.id || perm.permissionId || perm.permissionID;
                          const isChecked = rolePermissions.includes(pId);
                          return (
                            <div 
                              key={pId} 
                              onClick={() => handleTogglePermission(pId)}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                isChecked 
                                ? 'bg-indigo-50 border-indigo-100 text-indigo-900 font-bold' 
                                : 'bg-white border-transparent text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {isChecked ? <FaCheckSquare className="text-indigo-600 text-lg" /> : <FaSquare className="text-gray-100 text-lg" />}
                              </div>
                              <span className="text-xs tracking-tight uppercase font-medium">{perm.permissionName || perm.permissionKey.replace(/_/g, ' ')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RolePermission;