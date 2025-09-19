// src/services/authService.js
import axios from 'axios';
import config from '../config';

const authApi = axios.create({
  baseURL: config.API_BASE_URL, // Your backend API base URL
});

export const login = async (userName, password) => {
  const response = await authApi.post('/Auth/login', {
    userName,
    password,
  });
  if (response.data.isSuccess) {
    localStorage.setItem('accessToken', response.data.data.accessToken);
    localStorage.setItem('refreshToken', response.data.data.refreshToken);
    localStorage.setItem('rolePermissions', JSON.stringify(response.data.data.rolePermissions));
    localStorage.setItem('menuPermissions', JSON.stringify(response.data.data.menuPermissions));
  }
  return response;
};

export const refreshToken = async (accessToken, refreshToken) => {
  return await authApi.post('/Auth/refresh-token', {
    accessToken,
    refreshToken,
  });
};