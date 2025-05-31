import api from './axios';

const utilityService = {
  // Dapatkan semua kategori
  getCategories: () => api.get('/api/categories'),
  
  // Dapatkan semua tipe dompet
  getWalletTypes: () => api.get('/api/wallet-types'),
  
  // Dapatkan semua tipe transaksi
  getTransactionTypes: () => api.get('/api/transaction-types')
};

export default utilityService;