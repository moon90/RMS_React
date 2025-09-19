import api from '../utils/axios';

export const getAllOrders = async (params) => {
  return await api.get('/Orders', { params });
};

export const getOrderById = async (id) => {
  return await api.get(`/Orders/${id}`);
};

export const createOrder = async (order) => {
  return await api.post('/Orders', order);
};

export const updateOrder = async (id, order) => {
  return await api.put(`/Orders/${id}`, order);
};

export const deleteOrder = async (id) => {
  return await api.delete(`/Orders/${id}`);
};

export const processPaymentForOrder = async (paymentDetails) => {
  return await api.post('/Orders/process-payment', paymentDetails);
};
