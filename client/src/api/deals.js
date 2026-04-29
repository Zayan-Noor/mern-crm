import api from './client.js';

export const fetchDeals = () => api.get('/api/deals').then((r) => r.data);

export const createDeal = (body) => api.post('/api/deals', body).then((r) => r.data);

export const updateDeal = (id, body) => api.put(`/api/deals/${id}`, body).then((r) => r.data);

export const deleteDeal = (id) => api.delete(`/api/deals/${id}`).then((r) => r.data);
