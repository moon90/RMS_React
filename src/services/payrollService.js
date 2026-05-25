import api from '../utils/axios';

export const payrollService = {
    getAll: async () => {
        return await api.get('/Payroll');
    },
    runAi: async (data) => {
        return await api.post('/Payroll/run-ai', data);
    }
};

export default payrollService;
