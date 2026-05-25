import api from '../utils/axios';

export const stockTransferService = {
    getAllTransfers: async (params) => {
        return await api.get('/StockTransfers', { params });
    },
    getTransferById: async (id) => {
        return await api.get(`/StockTransfers/${id}`);
    },
    createTransfer: async (transferData) => {
        return await api.post('/StockTransfers', transferData);
    },
    updateStatus: async (id, status) => {
        return await api.put(`/StockTransfers/${id}/status`, `"${status}"`, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export default stockTransferService;
