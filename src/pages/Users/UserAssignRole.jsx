import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard';
import { getAllUsers, assignRoleToUser, unassignRoleFromUser, getUserById } from '../../services/userService.js';
import { getAllRoles } from '../../services/roleService.js'; // Assuming you have a role service

const UserAssignRole = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers({ pageNumber: 1, pageSize: 1000 }); // Fetch all users
      if (response.data.isSuccess) {
        setUsers(response.data.data.items);
      }
    } catch (error) {
      toast.error('Failed to fetch users.');
      console.error(error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getAllRoles({ pageNumber: 1, pageSize: 1000 }); // Fetch all roles
      if (response.data.isSuccess) {
        setRoles(response.data.data.items);
      }
    } catch (error) {
      toast.error('Failed to fetch roles.');
      console.error(error);
    }
  };

  const fetchUserRoles = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const response = await getUserById(selectedUser);
      if (response.data.isSuccess) {
        setUserRoles(response.data.data.roles || []);
      }
    } catch (error) {
      toast.error("Failed to fetch user's roles.");
      console.error(error);
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUserRoles();
  }, [fetchUserRoles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedRole) return;
    
    setIsLoading(true);
    try {
      const response = await assignRoleToUser(selectedUser, selectedRole);
      if (response.data.isSuccess) {
        toast.success('Role assigned successfully');
        fetchUserRoles();
        setSelectedRole('');
      } else {
        toast.error(response.data.message || 'Failed to assign role');
      }
    } catch (error) {
      toast.error('An error occurred while assigning the role.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to remove this role?')) return;

    try {
      const response = await unassignRoleFromUser(selectedUser, roleId);
      if (response.data.isSuccess) {
        toast.success('Role unassigned successfully');
        fetchUserRoles();
      } else {
        toast.error(response.data.message || 'Failed to unassign role');
      }
    } catch (error) {
      toast.error('An error occurred while unassigning the role.');
      console.error(error);
    }
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  return (
    <>
      <FormCard title="Assign Role to User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedUser} 
              onChange={handleUserChange} 
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.userID} value={user.userID}>
                  {user.firstName} {user.lastName} ({user.userName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedRole} 
              onChange={e => setSelectedRole(e.target.value)} 
              required
              disabled={!selectedUser}
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.roleId} value={role.roleId}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit" 
              disabled={isLoading || !selectedUser || !selectedRole}
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
            >
              {isLoading ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </form>
      </FormCard>

      <div className="mt-8">
        {selectedUser && userRoles.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Currently Assigned Roles</h3>
            <div className="overflow-x-auto">
              <ul className="space-y-2">
                {userRoles.map((role, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                    <span>{role}</span>
                    <button
                      onClick={() => {
                        const roleToDelete = roles.find(r => r.name === role);
                        if (roleToDelete) {
                          handleDeleteRole(roleToDelete.roleId);
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserAssignRole;
