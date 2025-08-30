import apiClient from '../utils/axios';

export const getAllPermissions = async (params) => {
  try {
    const response = await apiClient.get('/Permission', { params });
    return response.data;
  } catch (error) {
    console.error('Error in getAllPermissions:', error);
    throw error;
  }
};

export const createPermission = async (permissionData) => {
  return await apiClient.post('/Permission', permissionData);
};

export const updatePermission = async (permissionId, permissionData) => {
  return await apiClient.put(`/Permission/${permissionId}`, permissionData);
};

export const deletePermission = async (permissionId) => {
  return await apiClient.delete(`/Permission/${permissionId}`);
};
