import api from '../utils/axios';

export const inventoryAuditService = {
    getAllAudits: async () => {
        return await api.get('/InventoryAudits');
    },
    getAuditById: async (id) => {
        return await api.get(`/InventoryAudits/${id}`);
    },
    createAudit: async (auditData) => {
        return await api.post('/InventoryAudits', auditData);
    }
};

export default inventoryAuditService;
