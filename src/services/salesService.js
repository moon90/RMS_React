import api from '../utils/axios';
import { toast } from 'react-toastify';

const SALES_BASE_URL = '/sales';

// Helper to display a toast error and then propagate the error
const handleError = (message, error) => {
    toast.error(message);
    console.error(message, error);
    // Preserve original error for callers that may need it
    throw error;
};

export const salesService = {
    // Fetch list of sales – validates that `params` is an object (optional)
    getAllSales: async (params = {}) => {
        if (typeof params !== 'object') {
            toast.warn('Invalid query parameters provided; using default.');
            params = {};
        }
        try {
            const response = await api.get(SALES_BASE_URL, { params });
            return response;
        } catch (error) {
            handleError('Failed to load sales list.', error);
        }
    },

    // Retrieve a single sale by its ID – validates the ID first
    getSaleById: async (id) => {
        if (!id) {
            toast.warn('Sale ID is required to fetch details.');
            return Promise.reject(new Error('Missing sale ID'));
        }
        try {
            const response = await api.get(`${SALES_BASE_URL}/${id}`);
            return response;
        } catch (error) {
            handleError(`Failed to load sale #${id}.`, error);
        }
    },

    // Create a new sale – ensures payload is present
    createSale: async (saleData) => {
        if (!saleData || Object.keys(saleData).length === 0) {
            toast.warn('Please provide sale details before submitting.');
            return Promise.reject(new Error('Empty sale data'));
        }
        try {
            const response = await api.post(SALES_BASE_URL, saleData);
            toast.success('Sale created successfully.');
            return response;
        } catch (error) {
            handleError('Failed to create sale.', error);
        }
    },

    // Update an existing sale – validates ID and payload
    updateSale: async (id, saleData) => {
        if (!id) {
            toast.warn('Sale ID is required for updates.');
            return Promise.reject(new Error('Missing sale ID'));
        }
        if (!saleData || Object.keys(saleData).length === 0) {
            toast.warn('No changes detected; please modify the sale before updating.');
            return Promise.reject(new Error('Empty update payload'));
        }
        try {
            const response = await api.put(`${SALES_BASE_URL}/${id}`, saleData);
            toast.success('Sale updated successfully.');
            return response;
        } catch (error) {
            handleError(`Failed to update sale #${id}.`, error);
        }
    },

    // Delete a sale – validates the ID
    deleteSale: async (id) => {
        if (!id) {
            toast.warn('Sale ID is required for deletion.');
            return Promise.reject(new Error('Missing sale ID'));
        }
        try {
            const response = await api.delete(`${SALES_BASE_URL}/${id}`);
            toast.success('Sale removed successfully.');
            return response;
        } catch (error) {
            handleError(`Failed to delete sale #${id}.`, error);
        }
    },
};

