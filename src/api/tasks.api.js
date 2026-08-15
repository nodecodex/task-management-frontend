import apiClient from './client';

export const tasksApi = {
  getTasks: async (params = {}) => {
    return apiClient.get('/tasks', { params });
  },

  getTaskById: async (id) => {
    return apiClient.get(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    return apiClient.post('/tasks', taskData);
  },

  updateTask: async (id, taskData) => {
    return apiClient.put(`/tasks/${id}`, taskData);
  },

  deleteTask: async (id) => {
    return apiClient.delete(`/tasks/${id}`);
  },
};
