import api from '../utils/axios';

export const getAllIngredients = async (params) => {
  return await api.get('/Ingredient', { params });
};

export const getIngredientById = async (id) => {
  return await api.get(`/Ingredient/${id}`);
};

export const createIngredient = async (ingredient) => {
  return await api.post('/Ingredient', ingredient);
};

export const updateIngredient = async (id, ingredient) => {
  return await api.put(`/Ingredient/${id}`, ingredient);
};

export const deleteIngredient = async (id) => {
  return await api.delete(`/Ingredient/${id}`);
};

export const toggleIngredientStatus = async (id, status) => {
  return await api.put(`/Ingredient/${id}/status`, { status });
};
