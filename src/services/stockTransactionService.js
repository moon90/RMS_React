import api from '../utils/axios';

export const getAllStockTransactions = async (params) => {
  return await api.get('/StockTransactions', { params });
};

export const getStockTransactionById = async (id) => {
  return await api.get(`/StockTransactions/${id}`);
};

export const createStockTransaction = async (stockTransaction) => {
  return await api.post('/StockTransactions', stockTransaction);
};

export const updateStockTransaction = async (id, stockTransaction) => {
  return await api.put(`/StockTransactions/${id}`, stockTransaction);
};

export const deleteStockTransaction = async (id) => {
  return await api.delete(`/StockTransactions/${id}`);
};

export const toggleStockTransactionStatus = async (id, status) => {
  return await api.put(`/StockTransactions/${id}/status`, { status });
};
