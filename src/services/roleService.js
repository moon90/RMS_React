import api from '../utils/axios';

export const getAllRoles = async (params) => {
  return await api.get('/Roles', { params });
};

export const createRole = async (roleData) => {
  return await api.post('/Roles', roleData);
};

export const updateRole = async (roleId, roleData) => {
  return await api.put(`/Roles/${roleId}`, roleData);
};

export const deleteRole = async (roleId) => {
  return await api.delete(`/Roles/${roleId}`);
};