import React, { useState, useEffect, useMemo, useRef, createContext, useContext, useCallback } from 'react';
import axios from '../../utils/axios';
import { FaCheckCircle, FaExclamationCircle, FaSearch, FaTimesCircle } from 'react-icons/fa';

const PermissionContext = createContext();

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children, permissions, roles, setError, setSuccessMessage }) => {
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [initialSelectedPermissions, setInitialSelectedPermissions] = useState(new Set());

  const isDirty = useMemo(() => 
    !areSetsEqual(initialSelectedPermissions, selectedPermissions), 
    [initialSelectedPermissions, selectedPermissions]
  );

  const permissionsByModule = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const { moduleName } = permission;
      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }
      acc[moduleName].push(permission);
      return acc;
    }, {});
  }, [permissions]);

  const handlePermissionChange = useCallback((permissionId) => {
    setSelectedPermissions(prev => {
      const newPermissions = new Set(prev);
      if (newPermissions.has(permissionId)) {
        newPermissions.delete(permissionId);
      } else {
        newPermissions.add(permissionId);
      }
      return newPermissions;
    });
  }, []);

  const handleModuleCheckboxChange = useCallback((moduleName, isChecked) => {
    const permissionIdsToChange = permissions
      .filter(p => p.moduleName === moduleName)
      .map(p => p.id);

    setSelectedPermissions(prev => {
      const newPermissions = new Set(prev);
      if (isChecked) {
        permissionIdsToChange.forEach(id => newPermissions.add(id));
      } else {
        permissionIdsToChange.forEach(id => newPermissions.delete(id));
      }
      return newPermissions;
    });
  }, [permissions]);

  const value = {
    permissions,
    roles,
    permissionsByModule,
    selectedPermissions,
    isDirty,
    handlePermissionChange,
    handleModuleCheckboxChange,
    setSelectedPermissions,
    setInitialSelectedPermissions,
    initialSelectedPermissions,
    setError,
    setSuccessMessage
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

const areSetsEqual = (a, b) => {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const RoleList = ({ roles, selectedRole, onSelectRole, searchTerm, setSearchTerm }) => (
  <div className="w-1/4 bg-white border-r p-4 overflow-y-auto shadow-md">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Roles</h2>
    <div className="relative mb-4">
      <FaSearch className="absolute top-3 left-3 text-gray-400" />
      <input
        type="text"
        placeholder="Search roles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <ul>
      {roles.map(role => (
        <li
          key={role.roleID}
          onClick={() => onSelectRole(role)}
          className={`p-3 rounded-lg cursor-pointer mb-2 transition-all duration-200 ease-in-out ${selectedRole?.roleID === role.roleID ? 'bg-blue-600 text-white shadow-lg transform scale-105' : 'hover:bg-gray-200 hover:shadow-sm'}`}
        >
          {role.roleName}
        </li>
      ))}
    </ul>
  </div>
);

const PermissionGroup = ({ moduleName, permissionsInModule, searchTerm }) => {
    const {
        selectedPermissions,
        handlePermissionChange,
        handleModuleCheckboxChange,
    } = usePermissions();

    const moduleCheckboxRef = useRef();

    const filteredPermissions = permissionsInModule.filter(p => p.permissionName.toLowerCase().includes(searchTerm.toLowerCase()));

    const modulePermissionIds = useMemo(() => permissionsInModule.map(p => p.id), [permissionsInModule]);
    const selectedCount = modulePermissionIds.filter(id => selectedPermissions.has(id)).length;

    useEffect(() => {
        if (moduleCheckboxRef.current) {
            moduleCheckboxRef.current.indeterminate = selectedCount > 0 && selectedCount < modulePermissionIds.length;
        }
    }, [selectedCount, modulePermissionIds.length]);

    if (filteredPermissions.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center border-b pb-2 mb-3">
                <input
                    type="checkbox"
                    ref={moduleCheckboxRef}
                    checked={selectedCount === modulePermissionIds.length}
                    onChange={(e) => handleModuleCheckboxChange(moduleName, e.target.checked)}
                    className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <h3 className="text-lg font-semibold text-gray-700">{moduleName}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPermissions.map(perm => (
                    <div key={perm.id} className="flex items-center">
                        <input
                            type="checkbox"
                            id={`perm-${perm.id}`}
                            checked={selectedPermissions.has(perm.id)}
                            onChange={() => handlePermissionChange(perm.id)}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`perm-${perm.id}`} className="text-sm text-gray-600">{perm.permissionName}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PermissionsEditor = ({ searchTerm }) => {
  const { permissionsByModule } = usePermissions();
  const modules = Object.keys(permissionsByModule).sort();

  return (
    <div className="p-6">
      {modules.map(moduleName => (
        <PermissionGroup
          key={moduleName}
          moduleName={moduleName}
          permissionsInModule={permissionsByModule[moduleName]}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  );
};

const ActionBar = ({ isLoading, isDirty, onSave, onCancel, roleName }) => (
  <div className="sticky top-0 bg-white border-b p-4 z-10 shadow-sm">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">
        Editing Permissions for <span className="text-blue-600">{roleName}</span>
      </h2>
      <div className="flex items-center">
        {isDirty && (
          <>
            <span className="text-yellow-600 mr-4 flex items-center"><FaExclamationCircle className="mr-1" /> Unsaved Changes</span>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isLoading ? 'Saving...' : 'Save Permissions'}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg flex items-center text-white z-50";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {type === 'success' ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 text-white font-bold">X</button>
        </div>
    );
};

const RolePermissionPageContent = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');

  const debouncedRoleSearchTerm = useDebounce(roleSearchTerm, 300);
  const debouncedPermissionSearchTerm = useDebounce(permissionSearchTerm, 300);

  const {
    isDirty,
    selectedPermissions,
    setSelectedPermissions,
    setInitialSelectedPermissions,
    initialSelectedPermissions,
    roles,
    setError,
    setSuccessMessage
  } = usePermissions();

  useEffect(() => {
    if (selectedRole) {
      const fetchRolePermissions = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage('');
        try {
          const res = await axios.get(`/Roles/${selectedRole.roleID}/permissions`);
          const permissionIds = new Set(res.data.data.map(p => p.permissionID));
          setSelectedPermissions(permissionIds);
          setInitialSelectedPermissions(new Set(permissionIds));
        } catch (err) {
          if (err.response && err.response.status === 204) {
            setSelectedPermissions(new Set());
            setInitialSelectedPermissions(new Set());
          } else {
            console.error('Role permissions fetch error:', err);
            setError('Failed to load role permissions');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchRolePermissions();
    } else {
      setSelectedPermissions(new Set());
      setInitialSelectedPermissions(new Set());
    }
  }, [selectedRole, setSelectedPermissions, setInitialSelectedPermissions, setError, setSuccessMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      await axios.post(`/Roles/${selectedRole.roleID}/assign-permissions`, Array.from(selectedPermissions));
      setInitialSelectedPermissions(new Set(selectedPermissions));
      setSuccessMessage('Permissions updated successfully!');
    } catch (err) {
      console.error('Permission assignment error:', err);
      setError('Permission assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedPermissions(new Set(initialSelectedPermissions));
  };

  const filteredRoles = roles.filter(role =>
    role.roleName.toLowerCase().includes(debouncedRoleSearchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <RoleList
        roles={filteredRoles}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        searchTerm={roleSearchTerm}
        setSearchTerm={setRoleSearchTerm}
      />

      <div className="w-3/4 flex flex-col">
        {selectedRole ? (
          <div className="flex flex-col h-full">
            <ActionBar
              isLoading={loading}
              isDirty={isDirty}
              onSave={handleSubmit}
              onCancel={handleCancel}
              roleName={selectedRole.roleName}
            />
             <div className="relative m-4">
                <FaSearch className="absolute top-3 left-3 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search permissions..."
                    value={permissionSearchTerm}
                    onChange={(e) => setPermissionSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div className="overflow-y-auto flex-grow">
              {loading ? <div className="text-center p-4">Loading Permissions...</div> : <PermissionsEditor searchTerm={debouncedPermissionSearchTerm} />}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-xl">Please select a role to manage its permissions.</div>
          </div>
        )}
      </div>
    </div>
  );
}

const RolePermission = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          axios.get('/Roles'),
          axios.get('/Permission?pageSize=1000')
        ]);
        const getItems = (response) => response.data?.data?.items || response.data?.items || response.data;
        setRoles(getItems(rolesRes) || []);
        setPermissions(getItems(permissionsRes) || []);
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (permissions.length === 0) {
    return <div className="flex justify-center items-center h-screen">No permissions found.</div>;
  }

  return (
    <>
      <Notification message={error} type="error" onClose={() => setError(null)} />
      <Notification message={successMessage} type="success" onClose={() => setSuccessMessage('')} />
      <PermissionProvider permissions={permissions} roles={roles} setError={setError} setSuccessMessage={setSuccessMessage}>
        <RolePermissionPageContent />
      </PermissionProvider>
    </>
  );
};

export default RolePermission;