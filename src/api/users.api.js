import apiClient from './client';

export const usersApi = {
  getUsers: async (params = {}) => {
    return apiClient.get('/users', { params });
  },

  getUserById: async (id) => {
    return apiClient.get(`/users/${id}`);
  },

  createUser: async (userData) => {
    return apiClient.post('/users', userData);
  },

  updateUser: async (id, userData) => {
    return apiClient.put(`/users/${id}`, userData);
  },

  deleteUser: async (id) => {
    return apiClient.delete(`/users/${id}`);
  },
};
