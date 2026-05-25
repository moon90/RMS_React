import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormCard from '../../components/FormCard.jsx';
import { createUser, updateUser, uploadProfilePicture } from '../../services/userService.js';
import { getAllRoles, assignRolesToUser, unassignRolesFromUser } from '../../services/userRoleManagementService.js';
import { hasPermission } from '../../utils/permissionUtils';
import UserProfilePictureUpload from '../../components/UserProfilePictureUpload';
import { 
  FaUser, 
  FaLock, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaShieldAlt, 
  FaLayerGroup,
  FaIdBadge,
  FaSave,
  FaUndo
} from 'react-icons/fa';

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
  const [pendingFile, setPendingFile] = useState(null);

  const canCreateUser = hasPermission('USER_CREATE');
  const canUpdateUser = hasPermission('USER_UPDATE');
  const canAssignRoles = hasPermission('USER_ASSIGN_ROLES');
  const canUnassignRoles = hasPermission('USER_UNASSIGN_ROLES');

  useEffect(() => {
    const fetchRoles = async () => {
      if (canAssignRoles || canUnassignRoles) {
        try {
          const response = await getAllRoles({});
          if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
            setAllRoles(response.data.data.items);
          }
        } catch (error) {
          toast.error('Failed to synchronize role database.');
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
    }
  }, [isEdit, userData, allRoles]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleChange = (roleId) => {
    if (roleId > 0) {
      setSelectedRoleIds(prev => 
        prev.includes(roleId) 
          ? prev.filter(id => id !== roleId) 
          : [...prev, roleId]
      );
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
      setPendingFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const userPayload = { ...formData, Status: formData.status };

    try {
      if (isEdit) {
        if (!canUpdateUser) {
          toast.error('Privilege Insufficient: Update denied.');
          return;
        }
        const updateRes = await updateUser(formData.userID, userPayload);
        if (!updateRes.data.isSuccess) throw { response: updateRes };

        if (canAssignRoles || canUnassignRoles) {
          const currentRoleIds = allRoles
            .filter(role => userData.roles && userData.roles.includes(role.roleName) && role.roleID > 0)
            .map(role => role.roleID);
          
          const rolesToAssign = selectedRoleIds.filter(id => !currentRoleIds.includes(id));
          const rolesToUnassign = currentRoleIds.filter(id => !selectedRoleIds.includes(id));

          if (rolesToUnassign.length > 0 && canUnassignRoles) await unassignRolesFromUser(formData.userID, rolesToUnassign);
          if (rolesToAssign.length > 0 && canAssignRoles) await assignRolesToUser(formData.userID, rolesToAssign);
        }
      } else {
        if (!canCreateUser) {
          toast.error('Privilege Insufficient: Creation denied.');
          return;
        }
        const response = await createUser(userPayload);
        if (!response.data.isSuccess) {
          throw { response };
        }
        
        const newUserId = response.data.data.userID;

        // Step 3: Handle Pending Image Upload
        if (pendingFile && newUserId) {
          const imgFormData = new FormData();
          imgFormData.append('file', pendingFile);
          await uploadProfilePicture(newUserId, imgFormData);
        }

        if (selectedRoleIds.length > 0 && canAssignRoles) {
          const assignResponse = await assignRolesToUser(newUserId, selectedRoleIds);
          if (!assignResponse.data.isSuccess) {
            throw { response: assignResponse };
          }
        }
      }

      toast.success(isEdit ? 'User updated.' : 'User saved.');
      onSave();
    } catch (error) {
      const errorResponse = error.response?.data;
      if (errorResponse?.details) {
        const newErrors = {};
        errorResponse.details.forEach(err => newErrors[err.propertyName] = err.errorMessage);
        setErrors(newErrors);
        toast.error("Validation failed. Please correct the highlighted fields.");
      } else {
        toast.error(errorResponse?.message || 'Operation failed.');
      }
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-gray-700 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none";
  const labelClasses = "block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2";

  return (
    <div className="animate-fade-in">
      <FormCard>
        {showTitle && (
          <h2 className="text-2xl font-black mb-10 text-gray-900 flex items-center gap-3">
            <FaIdBadge className="text-blue-600" />
            {isEdit ? 'Edit User' : 'Add User'}
          </h2>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:col-span-2 flex flex-col items-center py-6">
              <UserProfilePictureUpload
                userId={isEdit ? formData.userID : null}
                currentImageUrl={userData?.profilePicture}
                onFileSelect={(file) => setPendingFile(file)}
                onUploadSuccess={(newUrl) => {
                  setFormData(prev => ({ ...prev, profilePicture: newUrl }));
                  toast.success('Profile picture updated.');
                }}
                onRemoveSuccess={() => {
                  toast.success('Profile picture removed.');
                }}
              />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Username */}
              <div className="relative group">
                <label className={labelClasses}>Username</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. jdoe_admin"
                    className={`${inputClasses} ${errors.userName ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.userName && <p className="text-red-500 text-[10px] font-bold mt-2 ml-4">{errors.userName}</p>}
              </div>

              {/* Password (Only for Create) */}
              {!isEdit && (
                <div className="relative group">
                  <label className={labelClasses}>Password</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                      className={`${inputClasses} ${errors.password ? 'border-red-400' : ''}`}
                    />
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div className="relative group md:col-span-2">
                <label className={labelClasses}>Full Name</label>
                <div className="relative">
                  <FaIdBadge className="absolute left-4 top-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Johnathan Doe"
                    className={`${inputClasses} ${errors.fullName ? 'border-red-400' : ''}`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative group">
                <label className={labelClasses}>Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@organization.com"
                    className={`${inputClasses} ${errors.email ? 'border-red-400' : ''}`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="relative group">
                <label className={labelClasses}>Phone</label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-4 top-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    className={`${inputClasses} ${errors.phone ? 'border-red-400' : ''}`}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="relative group">
                <label className={labelClasses}>Status</label>
                <select
                  name="status"
                  value={formData.status ? 'active' : 'inactive'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value === 'active' }))}
                  className={inputClasses}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Role Selection */}
              {(canAssignRoles || canUnassignRoles) && (
                <div className="md:col-span-2 mt-4">
                  <label className={labelClasses}>Assign Roles</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-blue-100 transition-all">
                    {allRoles.filter(role => role.roleID > 0).map(role => (
                      <div 
                        key={role.roleID} 
                        onClick={() => handleRoleChange(role.roleID)}
                        className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                          selectedRoleIds.includes(role.roleID) 
                          ? 'bg-white border-blue-500 shadow-md scale-105' 
                          : 'bg-white/50 border-transparent text-gray-400 grayscale'
                        }`}
                      >
                        <FaShieldAlt className={selectedRoleIds.includes(role.roleID) ? 'text-blue-600' : 'text-gray-300'} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{role.roleName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-10 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { handleReset(); if(onClose) onClose(); }}
              className="flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95"
            >
              <FaUndo /> Reset
            </button>

            {(isEdit && canUpdateUser || !isEdit && canCreateUser) && (
              <button
                type="submit"
                className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
              >
                <FaSave /> {isEdit ? 'Update' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default UserAdd;
