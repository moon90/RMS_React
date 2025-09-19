import api from '../utils/axios';

export const getAllStaff = async (params) => {
  return await api.get('/Staff', { params });
};

export const getStaffById = async (id) => {
  return await api.get(`/Staff/${id}`);
};

export const createStaff = async (staff) => {
  return await api.post('/Staff', staff);
};

export const updateStaff = async (id, staff) => {
  return await api.put(`/Staff/${id}`, staff);
};

export const deleteStaff = async (id) => {
  return await api.delete(`/Staff/${id}`);
};

export const toggleStaffStatus = async (id, status) => {
  return await api.put(`/Staff/${id}/status`, { status });
};
