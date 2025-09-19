import api from '../utils/axios';

export const getAllAuditLogs = async (pageNumber = 1, pageSize = 10, searchQuery = '', sortColumn = 'performedAt', sortDirection = 'desc') => {
  return await api.get('/AuditLog', {
    params: {
      pageNumber,
      pageSize,
      searchQuery,
      sortColumn,
      sortDirection,
    },
  });
};
