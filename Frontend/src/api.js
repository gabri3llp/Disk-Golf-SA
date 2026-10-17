import axios from 'axios';

const ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({ baseURL: `${ORIGIN}/api` });

export const fileUrl = (p) => `${ORIGIN}/${p}`;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error;
    const expired = err.response?.status === 401 && (msg === 'Invalid token' || msg === 'Not logged in');
    if (expired && !window.location.pathname.startsWith('/login')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;