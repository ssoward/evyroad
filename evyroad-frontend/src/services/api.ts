import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://evyroad.com/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get tokens from localStorage in the format used by AuthContext
    const storedTokens = localStorage.getItem('evyroad_tokens');
    let token = null;
    
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        token = parsedTokens.accessToken;
      } catch (error) {
        console.error('Error parsing stored tokens:', error);
      }
    }
    
    // Fallback to check for direct token storage (backward compatibility)
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - clear all token storage formats
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('evyroad_tokens');
      
      // Optionally trigger a custom event for auth context to handle logout
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
