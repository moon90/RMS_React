import api from '../utils/axios';

export const getAllInventory = async (params) => {
  return await api.get('/Inventory', { params });
};

export const getInventoryById = async (id) => {
  return await api.get(`/Inventory/${id}`);
};

export const createInventory = async (inventory) => {
  return await api.post('/Inventory', inventory);
};

export const updateInventory = async (id, inventory) => {
  return await api.put(`/Inventory/${id}`, inventory);
};

export const deleteInventory = async (id) => {
  return await api.delete(`/Inventory/${id}`);
};

export const toggleInventoryStatus = async (id, status) => {
  return await api.put(`/Inventory/${id}/status`, { status });
};
