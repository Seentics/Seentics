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

// Response interceptor for token refresh (does NOT unwrap .data)
api.interceptors.response.use(
  (response) => response, // ⚠️ Return full response
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refresh_token } = getStoredTokens();
        if (refresh_token) {
          const refreshRes = await axios.post(`${getApiUrl('/user/auth/refresh')}`, {
            refresh_Token: refresh_token,
          });

          if (refreshRes.data?.success) {
            const newAccessToken = refreshRes.data.data.tokens.access_token;
            const newRefreshToken = refreshRes.data.data.tokens.refresh_Token;

            // Update Zustand store manually via localStorage
            const raw = localStorage.getItem('auth-storage');
            if (raw) {
              const parsed = JSON.parse(raw);
              parsed.state.access_token = newAccessToken;
              parsed.state.refresh_token = newRefreshToken;
              localStorage.setItem('auth-storage', JSON.stringify(parsed));
            }

            // Retry original request with new access token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }

    return Promise.reject(error);
  }
);

export default api;
