import axios from 'axios';
import { refreshToken } from '../services/authService';
import config from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL, //'https://localhost:7083/api', // Your backend API base URL
  headers: {
    'Accept': 'application/json'
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  }, 
  (error) => {
      return Promise.reject(error);
	});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const access_token = localStorage.getItem('accessToken');
          const refresh_token = localStorage.getItem('refreshToken');
          const response = await refreshToken(access_token, refresh_token);
          if (response.data.isSuccess) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            api.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.data.accessToken;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // Redirect to login for 401 (if refresh failed) or 403
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('Authentication error, redirecting to login...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);	

export default api;