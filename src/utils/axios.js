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
    const requestUrl = originalRequest?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/Auth/login') ||
      requestUrl.includes('/Auth/refresh-token');
    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;
        try {
          const access_token = localStorage.getItem('accessToken');
          const refresh_token = localStorage.getItem('refreshToken');
          const response = await refreshToken(access_token, refresh_token);
          const refreshPayload = response.data?.data ?? response.data;
          const refreshedAccessToken = refreshPayload?.accessToken ?? response.data?.accessToken;
          const refreshedRefreshToken = refreshPayload?.refreshToken ?? response.data?.refreshToken;
          if (response.data?.isSuccess || refreshedAccessToken) {
            if (refreshedAccessToken) {
              localStorage.setItem('accessToken', refreshedAccessToken);
              api.defaults.headers.common['Authorization'] = 'Bearer ' + refreshedAccessToken;
            }
            if (refreshedRefreshToken) {
              localStorage.setItem('refreshToken', refreshedRefreshToken);
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // Redirect to login for 401 (if refresh failed)
      if (error.response.status === 401 && !isAuthEndpoint) {
        console.error('Authentication error, redirecting to login...');
        window.location.href = '/login';
      }

      // For 403, keep tokens and let the caller decide how to handle access.
      if (error.response.status === 403) {
        console.error('Authorization error (403).');
      }
    }

    return Promise.reject(error);
  }
);	

export default api;
