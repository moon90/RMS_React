import axios from 'axios';

const kitchenService = {
  getKitchenOrders: (statuses = ['Pending', 'Preparing']) => {
    const statusString = Array.isArray(statuses) ? statuses.join(',') : statuses;
    return axios.get(`/api/kitchen/orders/${statusString}`);
  },
  updateOrderStatus: (orderId, newStatus) => {
    return axios.post(`/api/kitchen/orders/${orderId}/status`, { orderStatus: newStatus });
  },
};

export default kitchenService;
