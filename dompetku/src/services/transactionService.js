import api from './axios';

const transactionService = {
  // Dapatkan semua transaksi
  getAllTransactions: () => api.get('/api/transactions'),
  
  // Dapatkan detail transaksi berdasarkan ID
  getTransactionById: (id) => api.get(`/api/transactions/${id}`),
  
  // Buat transaksi baru
  createTransaction: (data) => api.post('/api/transactions', data),
  
  // Update transaksi
  updateTransaction: (id, data) => api.put(`/api/transactions/${id}`, data),
  
  // Hapus transaksi
  deleteTransaction: (id) => api.delete(`/api/transactions/${id}`)
};

export default transactionService;