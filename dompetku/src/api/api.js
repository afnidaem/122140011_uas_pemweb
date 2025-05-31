// src/api/api.js
import axios from './axios'; // pastikan path ini benar

const api = {
  getWallets: () => axios.get('/wallets'),
  getWallet: (id) => axios.get('/wallets/${id}'),
  getWalletBalance: (id) => axios.get('/wallets/${id}/balance'),

  getTransactions: (params = {}) => axios.get('/transactions', { params }),
  getTransaction: (id) => axios.get('/transactions/${id}'),
  createTransaction: (data) => axios.post('/transactions', data),
  updateTransaction: (id, data) => axios.put('/transactions/${id}', data),
  deleteTransaction: (id) => axios.delete('/transactions/${id}'),

  getCategories: (type) => axios.get('/categories', { params: { type } }),
  getTransactionTypes: () => axios.get('/transaction-types'),
  getWalletTypes: () => axios.get('/wallet-types'),
};

export default api;