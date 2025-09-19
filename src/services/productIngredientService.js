import api from '../utils/axios';

export const getAllProductIngredients = async (params) => {
  return await api.get('/ProductIngredient', { params });
};

export const getProductIngredientById = async (id) => {
  return await api.get(`/ProductIngredient/${id}`);
};

export const createProductIngredient = async (productIngredient) => {
  return await api.post('/ProductIngredient', productIngredient);
};

export const updateProductIngredient = async (id, productIngredient) => {
  return await api.put(`/ProductIngredient/${id}`, productIngredient);
};

export const deleteProductIngredient = async (id) => {
  return await api.delete(`/ProductIngredient/${id}`);
};

export const toggleProductIngredientStatus = async (id, status) => {
  return await api.put(`/ProductIngredient/${id}/status`, { status });
};
