import apiClient from './client';

export const boardsApi = {
  getBoards: async (params = {}) => {
    return apiClient.get('/boards', { params });
  },

  getBoardById: async (id) => {
    return apiClient.get(`/boards/${id}`);
  },

  createBoard: async (boardData) => {
    return apiClient.post('/boards', boardData);
  },

  updateBoard: async (id, boardData) => {
    return apiClient.put(`/boards/${id}`, boardData);
  },

  deleteBoard: async (id) => {
    return apiClient.delete(`/boards/${id}`);
  },
};
