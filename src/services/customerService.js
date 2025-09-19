import api from '../utils/axios';

export const getAllCustomers = async (params) => {
  return await api.get('/Customers', { params });
};

export const getCustomerById = async (id) => {
  return await api.get(`/Customers/${id}`);
};

export const createCustomer = async (customer) => {
  return await api.post('/Customers', customer);
};

export const updateCustomer = async (id, customer) => {
  return await api.put(`/Customers/${id}`, customer);
};

export const deleteCustomer = async (id) => {
  return await api.delete(`/Customers/${id}`);
};

export const toggleCustomerStatus = async (id, status) => {
  return await api.put(`/Customers/${id}/status`, { status });
};
