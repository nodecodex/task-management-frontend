import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../api/users.api';
import { mapUserToOption } from '../utils/normalize';

export const useUsers = (autoFetch = true) => {
  const [users, setUsers] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getUsers({ limit: 100, ...params });
      const userList = response?.data || [];
      setUsers(userList);
      setUserOptions(userList.map(mapUserToOption));
      return userList;
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [autoFetch, fetchUsers]);

  return {
    users,
    userOptions,
    isLoading,
    error,
    fetchUsers,
  };
};

export default useUsers;
