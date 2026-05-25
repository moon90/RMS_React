import api from '../utils/axios';

export const systemService = {
    getStatus: async () => {
        return await api.get('/System/status');
    },
    initialize: async (data) => {
        return await api.post('/System/initialize', data);
    },
    testConnection: async () => {
        return await api.get('/System/test-db');
    },
    seedDemoData: async () => {
        return await api.post('/System/seed-demo');
    }
};

export default systemService;
