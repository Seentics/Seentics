import axios from 'axios';
import { getApiUrl } from './config';

// Helper function to extract tokens from Zustand's persisted state
function getStoredTokens() {
  const raw = localStorage.getItem('auth-storage');
  if (!raw) return { access_token: null, refresh_token: null };

  try {
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    return {
      access_token: state?.access_token || null,
      refresh_token: state?.refresh_token || null,
    };
  } catch (error) {
    console.error('Failed to parse auth-storage from localStorage:', error);
    return { access_token: null, refresh_token: null };
  }
}

// Create Axios instance
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to include access_token
api.interceptors.request.use(
  (config) => {
    const { access_token } = getStoredTokens();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (does NOT unwrap .data)
api.interceptors.response.use(
  (response) => response, // ⚠️ Return full response
  async (error) => {
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }

    return Promise.reject(error);
  }
);

export default api;
