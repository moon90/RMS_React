import api from '../utils/axios';

const BASE_PATH = '/SystemSettings';

export const systemSettingService = {
  getAllSettings: async () => {
    const response = await api.get(BASE_PATH);
    return response.data;
  },

  getSettingByKey: async (key) => {
    const response = await api.get(`${BASE_PATH}/${key}`);
    return response.data;
  },

  updateSetting: async (updateDto) => {
    const response = await api.put(BASE_PATH, updateDto);
    return response.data;
  },

  updateSettingsBulk: async (updateDtos) => {
    const response = await api.put(`${BASE_PATH}/bulk`, updateDtos);
    return response.data;
  },

  createSetting: async (createDto) => {
    const response = await api.post(BASE_PATH, createDto);
    return response.data;
  },

  deleteSetting: async (id) => {
    const response = await api.delete(`${BASE_PATH}/${id}`);
    return response.data;
  }
};

export default systemSettingService;
