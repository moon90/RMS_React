// src/services/authService.js
import api from '../utils/axios';

export const login = async (userName, password) => {
  return await api.post('/Auth/login', {
    userName,
    password,
  });
};