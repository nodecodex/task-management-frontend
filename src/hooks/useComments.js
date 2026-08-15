import { useState, useEffect, useCallback } from 'react';
import { commentsApi } from '../api/comments.api';

export const useComments = (taskId, autoFetch = true) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!taskId) {
      setComments([]);
      return [];
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await commentsApi.getTaskComments(taskId);
      const list = response?.data || [];
      setComments(list);
      return list;
    } catch (err) {
      setError(err.message || 'Failed to fetch comments');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (autoFetch && taskId) {
      fetchComments();
    }
  }, [autoFetch, taskId, fetchComments]);

  const addComment = async (commentText) => {
    if (!taskId || !commentText?.trim()) return null;
    const response = await commentsApi.addComment(taskId, { comment: commentText });
    await fetchComments();
    return response?.data;
  };

  const updateComment = async (commentId, commentText) => {
    const response = await commentsApi.updateComment(commentId, { comment: commentText });
    await fetchComments();
    return response?.data;
  };

  const deleteComment = async (commentId) => {
    const response = await commentsApi.deleteComment(commentId);
    await fetchComments();
    return response;
  };

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
};

export default useComments;
