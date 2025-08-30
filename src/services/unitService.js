import api from '../utils/axios';

export const getAllUnits = async (params) => {
  return await api.get('/Units', { params });
};

export const getUnitById = async (id) => {
  return await api.get(`/Units/${id}`);
};

export const createUnit = async (unit) => {
  return await api.post('/Units', unit);
};

export const updateUnit = async (id, unit) => {
  return await api.put(`/Units/${id}`, unit);
};

export const deleteUnit = async (id) => {
  return await api.delete(`/Units/${id}`);
};

export const toggleUnitStatus = async (id, status) => {
  return await api.put(`/Units/${id}/status`, { status });
};
