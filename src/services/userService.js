// src/services/userService.js
import api from '../utils/axios';

export const getAllUsers = async (params) => {
  return await api.get('/Users', { params });
};

export const getUserById = async (id) => {
  return await api.get(`/Users/${id}`);
};

export const createUser = async (user) => {
  return await api.post('/Users', user);
};

export const updateUser = async (id, user) => {
  return await api.put(`/Users/${id}`, user);
};

export const deleteUser = async (id) => {
  return await api.delete(`/Users/${id}`);
};

export const assignRoleToUser = async (userId, roleId) => {
  return await api.post(`/Users/${userId}/roles/${roleId}`);
};

export const unassignRoleFromUser = async (userId, roleId) => {
    return await api.delete(`/Users/${userId}/roles/${roleId}`);
};

export const assignRolesToUser = async (userId, roleIds) => {
  return await api.post(`/Users/${userId}/assign-roles`, roleIds);
};

export const unassignRolesFromUser = async (userId, roleIds) => {
  return await api.post(`/Users/${userId}/unassign-roles`, roleIds);
};

export const uploadProfilePicture = async (userId, formData) => { // Added
  return await api.post(`/Users/${userId}/upload-profile-picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data' // Important for FormData
    }
  });
};

export const toggleUserStatus = async (id, newStatus) => {
  return await api.put(`/Users/${id}/status`, { status: newStatus });
};


