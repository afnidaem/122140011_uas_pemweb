import api from './axios';

const walletService = {
  // Dapatkan semua dompet
  getAllWallets: () => api.get('/api/wallets'),
  
  // Dapatkan detail dompet berdasarkan ID
  getWalletById: (id) => api.get(`/api/wallets/${id}`),
  
  // Buat dompet baru
  createWallet: (data) => api.post('/api/wallets', data),
  
  // Update dompet
  updateWallet: (id, data) => api.put(`/api/wallets/${id}`, data),
  
  // Hapus dompet
  deleteWallet: (id) => api.delete(`/api/wallets/${id}`),
  
  // Dapatkan saldo dompet
  getWalletBalance: (id) => api.get(`/api/wallets/${id}/balance`)
};

export default walletService;