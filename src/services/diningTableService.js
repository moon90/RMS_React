import api from '../utils/axios';

export const getAllDiningTables = async (params) => {
  return await api.get('/DiningTables', { params });
};

export const getDiningTableById = async (id) => {
  return await api.get(`/DiningTables/${id}`);
};

export const createDiningTable = async (diningTable) => {
  return await api.post('/DiningTables', diningTable);
};

export const updateDiningTable = async (id, diningTable) => {
  return await api.put(`/DiningTables/${id}`, diningTable);
};

export const updateDiningTableStatus = async (tableStatusUpdate) => {
  return await api.put('/DiningTables/status', tableStatusUpdate);
};

export const deleteDiningTable = async (id) => {
  return await api.delete(`/DiningTables/${id}`);
};
