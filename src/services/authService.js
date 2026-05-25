// src/services/authService.js
import axios from 'axios';
import config from '../config';

const authApi = axios.create({
  baseURL: config.API_BASE_URL,
});

export const login = async (userName, password) => {
  return await authApi.post('/Auth/login', {
    userName,
    password,
  });
};

export const refreshToken = async (token) => {
  return await authApi.post('/Auth/refresh-token', {
    refreshToken: token,
  });
};