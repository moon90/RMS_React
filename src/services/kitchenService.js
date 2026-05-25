import api from '../utils/axios';
import { getPendingOrdersArray, getPendingOrderById, updatePendingOrder } from './offlineService';

const kitchenService = {
  getKitchenOrders: async (statuses = ['Pending', 'Preparing']) => {
    const statusArray = Array.isArray(statuses) ? statuses : statuses.split(',');
    const statusString = statusArray.join(',');
    
    try {
      const response = await api.get(`/Kitchen/orders/${statusString}`);
      
      // Combine with offline orders from Native IndexedDB
      const offlineOrders = await getPendingOrdersArray();
      const filteredOffline = offlineOrders.filter(o => statusArray.includes(o.orderStatus || o.OrderStatus || 'Pending'));
      
      let items = [];
      if (Array.isArray(response.data)) items = response.data;
      else if (response.data?.items) items = response.data.items;
      else if (response.data?.Items) items = response.data.Items;
      else if (response.data?.data) items = response.data.data;

      const formattedOffline = filteredOffline.map(o => ({
         ...o,
         isOffline: true,
         orderID: `OFF-${o.id}`,
         orderStatus: o.orderStatus || o.OrderStatus || 'Pending'
      }));

      // Wrap in standard response structure
      return { data: { isSuccess: true, data: [...formattedOffline, ...items] } };
    } catch (error) {
      console.warn("API failed, falling back to offline orders for kitchen", error);
      const offlineOrders = await getPendingOrdersArray();
      const filteredOffline = offlineOrders.filter(o => statusArray.includes(o.orderStatus || o.OrderStatus || 'Pending'));
      
      const formattedOffline = filteredOffline.map(o => ({
         ...o,
         isOffline: true,
         orderID: `OFF-${o.id}`,
         orderStatus: o.orderStatus || o.OrderStatus || 'Pending'
      }));

      return { data: { isSuccess: true, data: formattedOffline } };
    }
  },
  
  updateOrderStatus: async (orderId, newStatus, chefID = null) => {
    // Handle Offline Local Orders
    if (typeof orderId === 'string' && orderId.startsWith('OFF-')) {
       const localId = parseInt(orderId.replace('OFF-', ''), 10);
       const order = await getPendingOrderById(localId);
       if (order) {
           order.orderStatus = newStatus;
           order.OrderStatus = newStatus;
           if (chefID) {
               order.chefID = chefID;
               order.ChefID = chefID;
           }
           await updatePendingOrder(order);
           return { data: { isSuccess: true, message: "Local order updated" } };
       }
       throw new Error("Local offline order not found");
    }

    // Handle Server Orders
    try {
        return await api.post(`/Kitchen/orders/${orderId}/status`, { orderStatus: newStatus, chefID });
    } catch (err) {
        // If the internet is down, we cannot update a server order. 
        // A robust PWA would queue this status update, but for now we pass the error.
        throw err;
    }
  },
};

export default kitchenService;
