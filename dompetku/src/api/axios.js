import axios from 'axios';

// Buat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: 'http://localhost:6543/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;