import api from '../utils/axios';

export const getDashboardStats = async () => {
  return await api.get('/Dashboard/stats');
};
