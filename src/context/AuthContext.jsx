import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import socketService from '../services/socket.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return (savedUser && savedUser !== 'undefined' && savedUser !== 'null') ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('accessToken');
    return (savedToken && savedToken !== 'undefined' && savedToken !== 'null') ? savedToken : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify user session
  const verifySession = useCallback(async () => {
    const savedToken = localStorage.getItem('accessToken');
    if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      const userData = response?.data?.user || response?.data;
      if (userData?.id) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        socketService.connect(savedToken);
      } else {
        throw new Error('Invalid user session');
      }
    } catch (error) {
      console.warn('Session verification failed:', error.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      
      if (!response?.success || !response?.data?.token || !response?.data?.user) {
        throw new Error(response?.message || 'Login failed. Invalid response from server.');
      }

      const { user: userData, token: accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setToken(accessToken);
      socketService.connect(accessToken);

      return response;
    } catch (err) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    socketService.disconnect();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser: verifySession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
