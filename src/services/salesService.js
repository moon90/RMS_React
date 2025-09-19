import api from '../utils/axios';

const SALES_BASE_URL = '/sales';

export const salesService = {
    getAllSales: async () => {
        try {
            const response = await api.get(SALES_BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching all sales:', error);
            throw error;
        }
    },

    getSaleById: async (id) => {
        try {
            const response = await api.get(`${SALES_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sale with ID ${id}:`, error);
            throw error;
        }
    },

    createSale: async (saleData) => {
        try {
            const response = await api.post(SALES_BASE_URL, saleData);
            return response.data;
        } catch (error) {
            console.error('Error creating sale:', error);
            throw error;
        }
    },

    updateSale: async (id, saleData) => {
        try {
            const response = await api.put(`${SALES_BASE_URL}/${id}`, saleData);
            return response.data;
        } catch (error) {
            console.error(`Error updating sale with ID ${id}:`, error);
            throw error;
        }
    },

    deleteSale: async (id) => {
        try {
            const response = await api.delete(`${SALES_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting sale with ID ${id}:`, error);
            throw error;
        }
    },
};
