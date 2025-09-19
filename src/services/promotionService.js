import api from '../utils/axios';

const promotionService = {
  getAllPromotions: async () => {
    return await api.get('/Promotions');
  },

  getPromotionById: async (id) => {
    return await api.get(`/Promotions/${id}`);
  },

  createPromotion: async (promotionData) => {
    return await api.post('/Promotions', promotionData);
  },

  updatePromotion: async (id, promotionData) => {
    return await api.put(`/Promotions/${id}`, promotionData);
  },

  deletePromotion: async (id) => {
    return await api.delete(`/Promotions/${id}`);
  },

  getPromotionByCouponCode: async (couponCode) => {
    return await api.get(`/Promotions/by-code/${couponCode}`);
  },
};

export default promotionService;