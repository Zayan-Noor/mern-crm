import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

const existing = localStorage.getItem('token');
if (existing) {
  api.defaults.headers.common.Authorization = `Bearer ${existing}`;
}

export default api;
