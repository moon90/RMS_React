import apiClient from '../utils/axios';

// User-related API calls
export const fetchUsers = async (pageNumber = 1, pageSize = 10, searchQuery = '', sortColumn = 'userName', sortDirection = 'asc') => {
    const response = await apiClient.get(`/Users?pageNumber=${pageNumber}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`);
    return response.data.data;
};

export const assignRolesToUser = async (userId, roleIds) => {
    const response = await apiClient.post(`/Users/${userId}/assign-roles`, roleIds);
    return response.data;
};

export const unassignRolesFromUser = async (userId, roleIds) => {
    const response = await apiClient.post(`/Users/${userId}/unassign-roles`, roleIds);
    return response.data;
};

// Role-related API calls
export const fetchRoles = async (pageNumber = 1, pageSize = 1000, searchQuery = '', sortColumn = 'roleName', sortDirection = 'asc') => {
    const response = await apiClient.get(`/Roles?pageNumber=${pageNumber}&pageSize=${pageSize}&searchQuery=${searchQuery}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`);
    return response.data.data;
};

export const getAllRoles = async (params) => {
  try {
    const response = await apiClient.get('/Roles', { params });
    return response;
  } catch (error) {
    console.error('Error in getAllRoles:', error);
    throw error;
  }
};

export const createRole = async (roleData) => {
  return await apiClient.post('/Roles', roleData);
};

export const updateRole = async (roleId, roleData) => {
  return await apiClient.put(`/Roles/${roleId}`, roleData);
};

export const deleteRole = async (roleId) => {
  return await apiClient.delete(`/Roles/${roleId}`);
};
