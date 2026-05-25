import axios from '../utils/axios';

const alertService = {
  getAlerts: () => {
    return axios.get('/LowStockAlerts');
  },
  acknowledgeAlert: (id) => {
    return axios.post(`/LowStockAlerts/${id}/acknowledge`);
  },
};

export default alertService;
