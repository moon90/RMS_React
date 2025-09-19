import apiClient from '../utils/axios';

export const getLowStockProducts = async (params) => {
  try {
    const response = await apiClient.get('/Inventory/LowStock', { params });
    return response;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};

export const getLowStockAlerts = async () => {
  try {
    const response = await apiClient.get('/LowStockAlerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    throw error;
  }
};

export const adjustStock = async (transaction) => {
  try {
    const response = await apiClient.post('/StockTransaction', transaction);
    return response;
  } catch (error) {
    console.error('Error adjusting stock:', error);
    throw error;
  }
};
