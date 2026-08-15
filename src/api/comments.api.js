import apiClient from './client';

export const commentsApi = {
  getTaskComments: async (taskId, params = {}) => {
    return apiClient.get(`/tasks/${taskId}/comments`, { params });
  },

  addComment: async (taskId, commentData) => {
    return apiClient.post(`/tasks/${taskId}/comments`, commentData);
  },

  updateComment: async (id, commentData) => {
    return apiClient.put(`/comments/${id}`, commentData);
  },

  deleteComment: async (id) => {
    return apiClient.delete(`/comments/${id}`);
  },
};
