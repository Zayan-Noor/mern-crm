import api from './client.js';

export const fetchContacts = (params) =>
  api.get('/api/contacts', { params }).then((r) => r.data);

export const fetchContact = (id) => api.get(`/api/contacts/${id}`).then((r) => r.data);

export const createContact = (body) => api.post('/api/contacts', body).then((r) => r.data);

export const updateContact = (id, body) =>
  api.put(`/api/contacts/${id}`, body).then((r) => r.data);

export const deleteContact = (id) => api.delete(`/api/contacts/${id}`).then((r) => r.data);

export const addNote = (id, text) =>
  api.post(`/api/contacts/${id}/notes`, { text }).then((r) => r.data);
