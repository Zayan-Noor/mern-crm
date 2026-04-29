import api from './client.js';

export const fetchDashboardStats = () =>
  api.get('/api/dashboard/stats').then((r) => r.data);
