import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { createUser, updateUser } from '../../services/userService.js';
import { getAllRoles, assignRolesToUser, unassignRolesFromUser } from '../../services/userRoleManagementService.js';
import { hasPermission } from '../../utils/permissionUtils';
import UserProfilePictureUpload from '../../components/UserProfilePictureUpload';
// import { validateImage } from '../../utils/imageValidation'; // Removed

const UserAdd = ({ isEdit = false, userData = null, onClose, onSave, showTitle = true }) => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    status: true
  });
  const [errors, setErrors] = useState({});
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const canCreateUser = hasPermission('USER_CREATE');
  const canUpdateUser = hasPermission('USER_UPDATE');
  const canAssignRoles = hasPermission('USER_ASSIGN_ROLES');
  const canUnassignRoles = hasPermission('USER_UNASSIGN_ROLES');

  useEffect(() => {
    const fetchRoles = async () => {
      if (canAssignRoles || canUnassignRoles) {
        try {
          const response = await getAllRoles({});
          console.log(response.data);
          if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
            setAllRoles(response.data.data.items);
          } else if (response.data && response.data.data && !Array.isArray(response.data.data.items)) {
            setAllRoles([]);
            toast.error('Invalid roles data format received.');
          } else {
            setAllRoles([]);
            toast.error('Failed to fetch roles or no roles data found.');
          }
        } catch (error) {
          toast.error('An error occurred while fetching roles.');
          console.error(error);
        }
      }
    };

    fetchRoles();
  }, [canAssignRoles, canUnassignRoles]);

  useEffect(() => {
    if (isEdit && userData) {
      setFormData({
        userID: userData.userID,
        userName: userData.userName || '',
        password: '', // Do not show existing password
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        status: userData.status ?? true
      });
      if (userData.roles && allRoles.length > 0) {
        const initialSelected = allRoles
          .filter(role => userData.roles.includes(role.roleName) && role.roleID > 0)
          .map(role => role.roleID);
        setSelectedRoleIds(initialSelected);
      }
    }
  }, [isEdit, userData, allRoles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleChange = (e) => {
    const roleId = Number(e.target.value);
    if (roleId > 0) {
      if (e.target.checked) {
        setSelectedRoleIds(prev => [...prev, roleId]);
      } else {
        setSelectedRoleIds(prev => prev.filter(id => id !== roleId));
      }
    }
  };

  const handleReset = () => {
    setErrors({});
    if (isEdit && userData) {
      setFormData({
        userID: userData.userID,
        userName: userData.userName || '',
        password: '',
        fullName: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        status: userData.status ?? true
      });
      if (userData.roles && allRoles.length > 0) {
        const initialSelected = allRoles
          .filter(role => userData.roles.includes(role.roleName) && role.roleID > 0)
          .map(role => role.roleID);
        setSelectedRoleIds(initialSelected);
      }
    } else {
      setFormData({
        userName: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        status: true
      });
      setSelectedRoleIds([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const userPayload = { ...formData, Status: formData.status };

    try {
      if (isEdit) {
        if (!canUpdateUser) {
          toast.error('You do not have permission to update users.');
          return;
        }
        // Step 1: Update user details
        // Note: Profile picture file is NOT sent here. It's handled by a separate API call.
        // The profilePictureUrl in userPayload will be the existing one or cleared if removed.
        const userUpdateResponse = await updateUser(formData.userID, userPayload);
        if (!userUpdateResponse.data.isSuccess) {
          throw { response: userUpdateResponse };
        }

        // Step 2: Calculate role changes (only if user has permission)
        if (canAssignRoles || canUnassignRoles) {
          const currentRoleIds = allRoles
            .filter(role => userData.roles && userData.roles.includes(role.roleName) && role.roleID > 0)
            .map(role => role.roleID);
          
          let finalSelectedRoleIds = selectedRoleIds;
          if (finalSelectedRoleIds.length === 0) {
              const userRole = allRoles.find(role => role.roleName === 'User');
              if (userRole) {
                  finalSelectedRoleIds = [userRole.roleID];
              }
          }

          const rolesToAssign = finalSelectedRoleIds.filter(id => id > 0 && !currentRoleIds.includes(id));
          const rolesToUnassign = currentRoleIds.filter(id => id > 0 && !finalSelectedRoleIds.includes(id));

          // Step 4: Unassign roles that were removed
          if (rolesToUnassign.length > 0 && canUnassignRoles) {
            const unassignResponse = await unassignRolesFromUser(formData.userID, rolesToUnassign);
            if (!unassignResponse.data.isSuccess) {
              throw { response: unassignResponse };
            }
          }

          // Step 5: Assign new roles
          if (rolesToAssign.length > 0 && canAssignRoles) {
            const assignResponse = await assignRolesToUser(formData.userID, rolesToAssign);
            if (!assignResponse.data.isSuccess) {
              throw { response: assignResponse };
            }
          }
        }

      } else {
        if (!canCreateUser) {
          toast.error('You do not have permission to create users.');
          return;
        }
        // Create new user
        const response = await createUser(userPayload);
        if (!response.data.isSuccess) {
          throw { response };
        }
        if (selectedRoleIds.length > 0 && canAssignRoles) {
          const newUserId = response.data.data.userID;
          const assignResponse = await assignRolesToUser(newUserId, selectedRoleIds);
          if (!assignResponse.data.isSuccess) {
            throw { response: assignResponse };
          }
        }
      } // This closing brace was missing!

      // If all operations were successful
      toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
      onSave();
      if (onClose) onClose();

    } catch (error) {
      const errorResponse = error.response?.data;
      if (errorResponse && errorResponse.details && errorResponse.details.length > 0) {
        const newErrors = {};
        let toastMessage = "Validation failed:\n";
        errorResponse.details.forEach(err => {
          newErrors[err.propertyName] = err.errorMessage;
          toastMessage += `- ${err.errorMessage}\n`;
        });
        setErrors(newErrors);
        toast.error(toastMessage);
      } else {
        toast.error(errorResponse?.message || `An error occurred while ${isEdit ? 'updating' : 'creating'} the user.`);
      }
      console.error(error);
    }
  };


  return (
    <div className="p-3 max-w-4xl mx-auto">
      <FormCard>
        {showTitle && (
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isEdit ? 'Edit User' : 'Create New User'}
          </h2>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                placeholder="Enter username"
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 border ${errors.userName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  placeholder="Enter password"
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                placeholder="Enter full name"
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Enter email"
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                placeholder="Enter phone"
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {isEdit && ( // Conditionally render profile picture upload for edit mode
              <div>
                <UserProfilePictureUpload
                  userId={formData.userID}
                  currentImageUrl={userData?.profilePictureUrl}
                  onUploadSuccess={(newUrl) => {
                    setFormData(prev => ({ ...prev, profilePictureUrl: newUrl }));
                    toast.success('Profile picture updated successfully!');
                    // You might want to call onSave() here if the parent needs to re-fetch user data
                  }}
                  onRemoveSuccess={() => {
                    toast.success('Profile picture removed successfully!');
                    // You might want to call onSave() here
                  }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value === 'active',
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {(canAssignRoles || canUnassignRoles) && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                <div className="p-4 border border-gray-300 rounded-lg">
                  {allRoles.filter(role => role.roleID > 0).map(role => {
                    return (
                      <div key={role.roleID} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`role-${role.roleID}`}
                          value={role.roleID}
                          checked={selectedRoleIds.includes(role.roleID)}
                          onChange={handleRoleChange}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`role-${role.roleID}`} className="ml-2 block text-sm text-gray-900">
                          {String(role.roleName)}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                handleReset();
                if(onClose) onClose();
              }}
              className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
            >
              Reset
            </button>

            {(isEdit && canUpdateUser || !isEdit && canCreateUser) && (
              <button
                type="submit"
                className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow"
              >
                {isEdit ? 'Update User' : 'Create User'}
              </button>
            )}
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default UserAdd;
