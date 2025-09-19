import api from '../utils/axios';

const PURCHASES_BASE_URL = '/purchases';

export const purchaseService = {
    getAllPurchases: async () => {
        try {
            const response = await api.get(PURCHASES_BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching all purchases:', error);
            throw error;
        }
    },

    getPurchaseById: async (id) => {
        try {
            const response = await api.get(`${PURCHASES_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching purchase with ID ${id}:`, error);
            throw error;
        }
    },

    createPurchase: async (purchaseData) => {
        try {
            const response = await api.post(PURCHASES_BASE_URL, purchaseData);
            return response.data;
        } catch (error) {
            console.error('Error creating purchase:', error);
            throw error;
        }
    },

    updatePurchase: async (id, purchaseData) => {
        try {
            const response = await api.put(`${PURCHASES_BASE_URL}/${id}`, purchaseData);
            return response.data;
        } catch (error) {
            console.error(`Error updating purchase with ID ${id}:`, error);
            throw error;
        }
    },

    deletePurchase: async (id) => {
        try {
            const response = await api.delete(`${PURCHASES_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting purchase with ID ${id}:`, error);
            throw error;
        }
    },
};
