import api from '../utils/axios';

export const getAllCategories = async (params) => {
  return await api.get('/Categories', { params });
};

export const getCategoryById = async (id) => {
  return await api.get(`/Categories/${id}`);
};

export const createCategory = async (category) => {
  return await api.post('/Categories', category);
};

export const updateCategory = async (id, category) => {
  return await api.put(`/Categories/${id}`, category);
};

export const deleteCategory = async (id) => {
  return await api.delete(`/Categories/${id}`);
};

export const toggleCategoryStatus = async (id, status) => {
  return await api.put(`/Categories/${id}/status`, { status });
};

export const exportCategories = async () => {
  const response = await api.get('/Categories/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  let fileName = 'categories.csv';
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
    if (fileNameMatch && fileNameMatch[1]) {
      fileName = fileNameMatch[1];
    }
  }
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return response;
};

export const importCategories = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.post('/Categories/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
