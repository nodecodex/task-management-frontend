import apiClient from './client';

export const tagsApi = {
  getTags: async () => {
    return apiClient.get('/tags');
  },

  getTagById: async (id) => {
    return apiClient.get(`/tags/${id}`);
  },

  createTag: async (tagData) => {
    return apiClient.post('/tags', tagData);
  },

  updateTag: async (id, tagData) => {
    return apiClient.put(`/tags/${id}`, tagData);
  },

  deleteTag: async (id) => {
    return apiClient.delete(`/tags/${id}`);
  },
};
