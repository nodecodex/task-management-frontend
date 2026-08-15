import apiClient from './client';

export const dashboardApi = {
  getDashboardStats: async (params = {}) => {
    return apiClient.get('/dashboard', { params });
  },
};
