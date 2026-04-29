import api from './client.js';

export const login = (body) => api.post('/api/auth/login', body).then((r) => r.data);
export const register = (body) => api.post('/api/auth/register', body).then((r) => r.data);
export const getMe = () => api.get('/api/auth/me').then((r) => r.data);
