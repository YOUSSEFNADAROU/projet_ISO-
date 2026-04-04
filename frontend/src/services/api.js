import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const chatExpertApi = (payload) => api.post('/report/chat-expert', payload);
export const chatContextualApi = (payload) => api.post('/report/chat-contextual', payload);

export default api;
