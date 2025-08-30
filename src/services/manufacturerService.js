
import api from '../utils/axios';

export const getAllManufacturers = async (params) => {
  return await api.get('/Manufacturers', { params });
};

export const getManufacturerById = async (id) => {
  return await api.get(`/Manufacturers/${id}`);
};

export const createManufacturer = async (manufacturer) => {
  return await api.post('/Manufacturers', manufacturer);
};

export const updateManufacturer = async (id, manufacturer) => {
  return await api.put(`/Manufacturers/${id}`, manufacturer);
};

export const deleteManufacturer = async (id) => {
  return await api.delete(`/Manufacturers/${id}`);
};

export const toggleManufacturerStatus = async (id, status) => {
  return await api.put(`/Manufacturers/${id}/status`, { status });
};
