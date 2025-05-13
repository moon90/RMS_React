// src/services/authService.js
import axios from 'axios';

export const login = async (userName, password) => {
  return await axios.post('https://localhost:7083/api/Auth/login', {
    userName,
    password,
  });
};