
import api from '../utils/axios';

export const getAllSuppliers = async (params) => {
  return await api.get('/Suppliers', { params });
};

export const getSupplierById = async (id) => {
  return await api.get(`/Suppliers/${id}`);
};

export const createSupplier = async (supplier) => {
  return await api.post('/Suppliers', supplier);
};

export const updateSupplier = async (id, supplier) => {
  return await api.put(`/Suppliers/${id}`, supplier);
};

export const deleteSupplier = async (id) => {
  return await api.delete(`/Suppliers/${id}`);
};

export const toggleSupplierStatus = async (id, status) => {
  return await api.put(`/Suppliers/${id}/status`, { status });
};
