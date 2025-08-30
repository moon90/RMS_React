import api from '../utils/axios';

export const getAllAuditLogs = async () => {
  return await api.get('/AuditLog');
};
