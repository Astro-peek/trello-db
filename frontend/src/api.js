import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trello_token');
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export default api;
