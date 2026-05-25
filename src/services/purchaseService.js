import api from '../utils/axios';

const PURCHASES_BASE_URL = '/purchases';

export const purchaseService = {
    getAllPurchases: async (params) => {
        return await api.get(PURCHASES_BASE_URL, { params });
    },

    getPurchaseById: async (id) => {
        return await api.get(`${PURCHASES_BASE_URL}/${id}`);
    },

    createPurchase: async (purchaseData) => {
        return await api.post(PURCHASES_BASE_URL, purchaseData);
    },

    updatePurchase: async (id, purchaseData) => {
        return await api.put(`${PURCHASES_BASE_URL}/${id}`, purchaseData);
    },

    deletePurchase: async (id) => {
        return await api.delete(`${PURCHASES_BASE_URL}/${id}`);
    },
};
