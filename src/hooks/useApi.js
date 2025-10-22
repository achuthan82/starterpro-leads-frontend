import { useState, useEffect, useCallback } from 'react';
import { apiUtils, API_STATUS } from 'utils/apiService';

/**
 * Custom hook for API calls with loading states and error handling
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, status, refetch, reset }
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const { 
    immediate = true, 
    defaultData = null,
    onSuccess,
    onError 
  } = options;

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(API_STATUS.IDLE);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      setStatus(API_STATUS.LOADING);

      const result = await apiFunction(...args);
      
      setData(result);
      setStatus(API_STATUS.SUCCESS);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const formattedError = apiUtils.formatError(err);
      setError(formattedError);
      setStatus(API_STATUS.ERROR);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(defaultData);
    setLoading(false);
    setError(null);
    setStatus(API_STATUS.IDLE);
  }, [defaultData]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate && dependencies.length === 0) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return {
    data,
    loading,
    error,
    status,
    execute,
    refetch,
    reset,
    isLoading: loading,
    isSuccess: status === API_STATUS.SUCCESS,
    isError: status === API_STATUS.ERROR,
    isIdle: status === API_STATUS.IDLE
  };
};

/**
 * Hook for authentication operations
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
    
    // You can also decode token and set user data here
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    }
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };
};

/**
 * Hook for paginated API calls
 */
export const usePagination = (apiFunction, options = {}) => {
  const { 
    pageSize = 10,
    initialPage = 1,
    immediate = true 
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInfo, setPageInfo] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  const { data, loading, error, execute, status } = useApi(
    (page = currentPage, limit = pageSize, ...args) =>
      apiFunction({ page, limit, ...args }),
    [currentPage, pageSize],
    { immediate: false }
  );

  const loadPage = useCallback(async (page, ...args) => {
    setCurrentPage(page);
    const result = await execute(page, pageSize, ...args);
    
    if (result && result.pagination) {
      setPageInfo({
        total: result.pagination.total || 0,
        totalPages: result.pagination.totalPages || 0,
        hasNext: result.pagination.hasNext || false,
        hasPrevious: result.pagination.hasPrevious || false
      });
    }
    
    return result;
  }, [execute, pageSize]);

  const nextPage = useCallback(() => {
    if (pageInfo.hasNext) {
      loadPage(currentPage + 1);
    }
  }, [currentPage, pageInfo.hasNext, loadPage]);

  const previousPage = useCallback(() => {
    if (pageInfo.hasPrevious) {
      loadPage(currentPage - 1);
    }
  }, [currentPage, pageInfo.hasPrevious, loadPage]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pageInfo.totalPages) {
      loadPage(page);
    }
  }, [loadPage, pageInfo.totalPages]);

  useEffect(() => {
    if (immediate) {
      loadPage(currentPage);
    }
  }, []);

  return {
    data: data?.data || [],
    loading,
    error,
    status,
    currentPage,
    pageInfo,
    loadPage,
    nextPage,
    previousPage,
    goToPage,
    refetch: () => loadPage(currentPage)
  };
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticUpdate = (apiFunction, options = {}) => {
  const { onSuccess, onError, rollback = true } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previousData, setPreviousData] = useState(null);

  const execute = useCallback(async (optimisticData, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      // Store previous data for rollback
      setPreviousData(data);
      
      // Apply optimistic update
      setData(optimisticData);

      // Execute actual API call
      const result = await apiFunction(...args);
      
      // Update with real data
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      // Rollback on error if enabled
      if (rollback && previousData !== null) {
        setData(previousData);
      }
      
      setError(apiUtils.formatError(err));
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, data, previousData, onSuccess, onError, rollback]);

  return {
    data,
    loading,
    error,
    execute
  };
};

export default useApi; 