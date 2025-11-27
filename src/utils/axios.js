import axios from 'axios';

import { JWT_HOST_API, REQUEST_CONFIG } from 'configs/auth.config';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: JWT_HOST_API,
  ...REQUEST_CONFIG
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle business logic errors in successful HTTP responses
    if (response && response.data && typeof response.data === 'object') {
      const { code, error, message, status } = response.data;
      // Example: if API returns { code: 401, ... } in a 200 response
      if (code === 401 || status === 401 || error === 401) {
        const isOnLoginPage = window.location.pathname === '/login' || window.location.pathname.includes('/login');
        if (!isOnLoginPage) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('agentId');
          localStorage.removeItem('currentUser');
          window.location.href = '/login?error=token';
        }
        return Promise.reject({ message: 'Your token has expired. Please log in again.' });
      }
      if (code === 403 || status === 403 || error === 403) {
        return Promise.reject({ message: message || 'You do not have permission to access this resource.' });
      }
      if (code === 404 || status === 404 || error === 404) {
        return Promise.reject({ message: message || 'Resource not found.' });
      }
      if (code === 500 || status === 500 || error === 500) {
        return Promise.reject({ message: message || 'Internal server error.' });
      }
    }
    return response;
  },
  (error) => {
    // Handle different error status codes
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401: {
          // Unauthorized - only clear auth if it's not a login request
          const isLoginRequest = error.config?.url?.includes('/login') || error.config?.url?.includes('/auth');
          const isOnLoginPage = window.location.pathname === '/login' || window.location.pathname.includes('/login');
          console.log('401 Error - URL:', error.config?.url, 'Is Login Request:', isLoginRequest, 'Is On Login Page:', isOnLoginPage);
          if (!isLoginRequest && !isOnLoginPage) {
            console.log('Clearing localStorage due to 401 error');
            localStorage.removeItem('authToken');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('agentId');
            localStorage.removeItem('currentUser');
            window.location.href = '/login?error=token';
          }
          return Promise.reject({ message: 'Your token has expired. Please log in again.' });
        }
        case 403:
          console.error('Access forbidden:', data?.message || 'Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found:', data?.message || 'Endpoint not found');
          break;
        case 422:
          console.error('Validation error:', data?.errors || data?.message);
          break;
        case 429:
          console.error('Rate limited:', data?.message || 'Too many requests');
          break;
        case 500:
          console.error('Server error:', data?.message || 'Internal server error');
          break;
        default:
          console.error('API Error:', data?.message || 'Something went wrong');
      }
      return Promise.reject(error.response.data || error.response);
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      return Promise.reject({ message: 'Network error. Please check your connection.' });
    } else {
      // Other error
      console.error('Error:', error.message);
      return Promise.reject({ message: error.message || 'Something went wrong' });
    }
  }
);

export default axiosInstance;
