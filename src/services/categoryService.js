import api from '../utils/axios';

export const getAllCategories = async (params) => {
  return await api.get('/Categories', { params });
};

export const getCategoryById = async (id) => {
  return await api.get(`/Categories/${id}`);
};

export const createCategory = async (category) => {
  return await api.post('/Categories', category);
};

export const updateCategory = async (id, category) => {
  return await api.put(`/Categories/${id}`, category);
};

export const deleteCategory = async (id) => {
  return await api.delete(`/Categories/${id}`);
};

export const toggleCategoryStatus = async (id, status) => {
  return await api.put(`/Categories/${id}/status`, { status });
};
