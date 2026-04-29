import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Derive backend base URL from API_URL when NEXT_PUBLIC_BACKEND_URL is not explicitly set
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || API_URL.replace(/\/api\/?$/, '');

console.log('API_URL:', API_URL);
console.log('BACKEND_URL:', BACKEND_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Se estamos via ngrok, reescrever URL para usar backend ngrok diretamente
  if (typeof window !== 'undefined' && window.location.hostname.includes('ngrok')) {
    config.baseURL = `${BACKEND_URL}/api`;
  }
  
  console.log('[API Request]', {
    method: config.method?.toUpperCase(),
    url: config.url,
    hasBody: !!config.data,
    bodyType: typeof config.data
  });
  
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error] Status:', error.response?.status, 'Message:', error.response?.data?.error || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
