import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8080/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = axios.create({
  baseURL: AUTH_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh logic with request queuing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Centralized refresh function — used by both the interceptor and the proactive timer
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post(`${AUTH_URL}/refresh`, { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data;

  localStorage.setItem('accessToken', accessToken);
  if (newRefreshToken) {
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  // Restart the proactive refresh timer with the new token
  startTokenRefreshTimer();

  return accessToken;
};

// Proactive refresh — renew the token BEFORE it expires
let refreshTimerId = null;
const TOKEN_REFRESH_MARGIN = 60 * 1000; // Refresh 1 minute before expiry

const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert seconds to ms
  } catch {
    return null;
  }
};

export const startTokenRefreshTimer = () => {
  // Clear any existing timer
  if (refreshTimerId) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) return;

  const expiry = getTokenExpiry(token);
  if (!expiry) return;

  const now = Date.now();
  const delay = expiry - now - TOKEN_REFRESH_MARGIN;

  if (delay <= 0) {
    // Token is already expired or about to expire — refresh now
    refreshAccessToken().catch(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    });
    return;
  }

  console.log(`[Auth] Token refresh scheduled in ${Math.round(delay / 1000)}s`);
  refreshTimerId = setTimeout(async () => {
    try {
      await refreshAccessToken();
      console.log('[Auth] Token proactively refreshed');
    } catch (err) {
      console.error('[Auth] Proactive token refresh failed:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }, delay);
};

export const stopTokenRefreshTimer = () => {
  if (refreshTimerId) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }
};

// Response interceptor — handles 401, 403, and Network Errors (CORS-blocked 401s)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Treat 401, 403, or Network Error (CORS-blocked 401) as auth failures
    const isAuthError = error.response?.status === 401 || error.response?.status === 403;
    const isNetworkError = !error.response && error.message === 'Network Error';

    if ((!isAuthError && !isNetworkError) || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const accessToken = await refreshAccessToken();

      // Replay all queued requests with the new token
      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      // Clear everything and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
