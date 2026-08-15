import apiClient from './client';

export const categoriesApi = {
  getCategories: async () => {
    return apiClient.get('/categories');
  },

  getCategoryById: async (id) => {
    return apiClient.get(`/categories/${id}`);
  },

  createCategory: async (categoryData) => {
    return apiClient.post('/categories', categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  },
};
