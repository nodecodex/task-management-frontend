import { useState, useEffect, useCallback, useMemo } from 'react';
import { dashboardApi } from '../api/dashboard.api';

export const useDashboard = (filters = {}, autoFetch = true) => {
  const [stats, setStats] = useState({
    total_tasks: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    blocked: 0,
    high_priority: 0,
    urgent: 0,
    overdue: 0,
    total_users: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stringify filters so unstable object references ({}) don't cause infinite re-render loops
  const filtersString = useMemo(() => JSON.stringify(filters || {}), [filters]);

  const fetchStats = useCallback(async (customFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = customFilters !== undefined ? customFilters : JSON.parse(filtersString);
      const response = await dashboardApi.getDashboardStats(params);
      const data = response?.data || {};
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [filtersString]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export default useDashboard;
