
import api from '../utils/axios';

export const getAllProducts = async (params) => {
  return await api.get('/Products', { params });
};

export const getProductById = async (id) => {
  return await api.get(`/Products/${id}`);
};

export const createProduct = async (product) => {
  return await api.post('/Products', product);
};

export const updateProduct = async (id, product) => {
  return await api.put(`/Products/${id}`, product);
};

export const deleteProduct = async (id) => {
  return await api.delete(`/Products/${id}`);
};

export const toggleProductStatus = async (id, status) => {
  return await api.put(`/Products/${id}/status`, { status });
};
