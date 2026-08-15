import { useState, useEffect, useCallback } from 'react';
import { boardsApi } from '../api/boards.api';
import { mapBoardToOption } from '../utils/normalize';

export const useBoards = (autoFetch = true) => {
  const [boards, setBoards] = useState([]);
  const [boardOptions, setBoardOptions] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBoards = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await boardsApi.getBoards({ limit: 100, ...params });
      const boardList = response?.data || [];
      setBoards(boardList);
      const options = boardList.map(mapBoardToOption);
      setBoardOptions(options);

      // Default active board to the first board if none selected or not present
      if (boardList.length > 0) {
        setActiveBoard((current) => {
          if (!current || !boardList.some((b) => b.id === current.id)) {
            return boardList[0];
          }
          return current;
        });
      }
      return boardList;
    } catch (err) {
      setError(err.message || 'Failed to fetch boards');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchBoards();
    }
  }, [autoFetch, fetchBoards]);

  const createBoard = async (boardData) => {
    const response = await boardsApi.createBoard(boardData);
    await fetchBoards();
    return response?.data;
  };

  const updateBoard = async (id, boardData) => {
    const response = await boardsApi.updateBoard(id, boardData);
    await fetchBoards();
    return response?.data;
  };

  const deleteBoard = async (id) => {
    const response = await boardsApi.deleteBoard(id);
    await fetchBoards();
    return response;
  };

  return {
    boards,
    boardOptions,
    activeBoard,
    setActiveBoard,
    isLoading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
  };
};

export default useBoards;
