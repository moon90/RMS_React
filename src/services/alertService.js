import axios from '../utils/axios';

const alertService = {
  getAlerts: () => {
    return axios.get('/api/alerts');
  },
  acknowledgeAlert: (id) => {
    return axios.post(`/api/alerts/${id}/acknowledge`);
  },
};

export default alertService;
