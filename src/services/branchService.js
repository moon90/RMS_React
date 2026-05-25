import api from '../utils/axios';

export const branchService = {
    getAllBranches: async () => {
        return await api.get('/Branches');
    },
    getBranchById: async (id) => {
        return await api.get(`/Branches/${id}`);
    },
    createBranch: async (branchData) => {
        return await api.post('/Branches', branchData);
    },
    deleteBranch: async (id) => {
        return await api.delete(`/Branches/${id}`);
    }
};

export default branchService;
