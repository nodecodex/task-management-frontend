import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    if (status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth-login' && window.location.pathname !== '/auth-register') {
        window.location.href = '/auth-login';
      }
    }

    let detailMessage = null;
    if (Array.isArray(errorData?.error?.details) && errorData.error.details.length > 0) {
      detailMessage = errorData.error.details.map((d) => d.message || d).join(', ');
    } else if (Array.isArray(errorData?.details) && errorData.details.length > 0) {
      detailMessage = errorData.details.map((d) => d.message || d).join(', ');
    } else if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
      detailMessage = errorData.errors.map((d) => d.msg || d.message || d).join(', ');
    }

    const message =
      detailMessage ||
      errorData?.message ||
      (typeof errorData?.error === 'string' ? errorData.error : null) ||
      error.message ||
      'An unexpected error occurred';

    const enhancedError = new Error(message);
    enhancedError.status = status;
    enhancedError.code = errorData?.error?.code || errorData?.code;
    enhancedError.data = errorData;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default apiClient;
