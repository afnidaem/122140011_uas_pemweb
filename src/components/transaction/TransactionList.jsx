import { useState, useEffect } from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';
import TransactionItem from './TransactionItem';
import Button from '../common/Button';
import Modal from '../common/Modal';
import TransactionForm from './TransactionForm';
import { FiPlus, FiFilter, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatCurrency';

const TransactionList = () => {
  const {
    transactions,
    loading,
    error,
    filters,
    pagination,
    fetchTransactions,
    deleteTransaction,
    setFilters,
    setPagination,
    clearError,
  } = useTransaction();
  
  const { wallets } = useWallet();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmTransaction, setDeleteConfirmTransaction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterForm, setFilterForm] = useState({
    searchQuery: filters.searchQuery || '',
    walletId: filters.walletId || '',
    type: filters.type || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
  });

  // Fetch transactions when component mounts or filters/pagination change
  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page, pagination.limit]);

  // Calculate stats
  const stats = {
    totalIncome: transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpense: transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  };
  
  stats.balance = stats.totalIncome - stats.totalExpense;

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteClick = (transaction) => {
    setDeleteConfirmTransaction(transaction);
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTransaction) return;

    setDeleteLoading(true);
    const result = await deleteTransaction(deleteConfirmTransaction.id);
    setDeleteLoading(false);

    if (result.success) {
      setDeleteConfirmTransaction(null);
      fetchTransactions();
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setFilters({
      searchQuery: filterForm.searchQuery,
      walletId: filterForm.walletId || null,
      type: filterForm.type || null,
      startDate: filterForm.startDate ? new Date(filterForm.startDate) : null,
      endDate: filterForm.endDate ? new Date(filterForm.endDate) : null,
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilterForm({
      searchQuery: '',
      walletId: '',
      type: '',
      startDate: '',
      endDate: '',
    });
    setFilters({
      searchQuery: '',
      walletId: null,
      type: null,
      startDate: null,
      endDate: null,
    });
    setShowFilters(false);
  };

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination({ page: newPage });
  };

  const renderPagination = () => {
    const { page, totalPages } = pagination;
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-4">
        <button
          onClick={() => changePage(page - 1)}
          disabled={page === 1}
          className={`p-2 rounded-md ${
            page === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FiChevronLeft />
        </button>
        
        <div className="text-sm text-gray-700">
          Halaman {page} dari {totalPages}
        </div>
        
        <button
          onClick={() => changePage(page + 1)}
          disabled={page === totalPages}
          className={`p-2 rounded-md ${
            page === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FiChevronRight />
        </button>
      </div>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
        <p className="mt-2 text-gray-600">Memuat transaksi...</p>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>Gagal memuat transaksi: {error}</p>
        <Button variant="outline" className="mt-2" onClick={clearError}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  const hasActiveFilters = 
    filters.searchQuery ||
    filters.walletId ||
    filters.type ||
    filters.startDate ||
    filters.endDate;

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50">
          <div className="text-green-600 font-medium">Total Pemasukan</div>
          <div className="text-2xl font-bold text-green-700 mt-2">
            {formatCurrency(stats.totalIncome)}
          </div>
        </Card>
        
        <Card className="bg-red-50">
          <div className="text-red-600 font-medium">Total Pengeluaran</div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            {formatCurrency(stats.totalExpense)}
          </div>
        </Card>
        
        <Card className={`${stats.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <div className={`${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} font-medium`}>
            Saldo
          </div>
          <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-700' : 'text-orange-700'} mt-2`}>
            {formatCurrency(stats.balance)}
          </div>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div className="flex-1 w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={filterForm.searchQuery}
            onChange={(e) => {
              handleFilterChange(e);
              // Apply search directly without needing to click filter button
              setFilters({
                ...filters,
                searchQuery: e.target.value,
              });
            }}
            name="searchQuery"
            className="form-input pl-10 w-full"
          />
        </div>
        
        <div className="flex space-x-2 w-full md:w-auto">
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <FiFilter className="mr-1" /> {hasActiveFilters ? 'Filter Aktif' : 'Filter'}
          </Button>
          
          <Button onClick={handleAddClick} className="flex items-center">
            <FiPlus className="mr-1" /> Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="walletId" className="form-label">
                Dompet
              </label>
              <select
                id="walletId"
                name="walletId"
                value={filterForm.walletId}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">Semua Dompet</option>
                {wallets.map(wallet => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="type" className="form-label">
                Tipe Transaksi
              </label>
              <select
                id="type"
                name="type"
                value={filterForm.type}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">Semua Tipe</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="startDate" className="form-label">
                Dari Tanggal
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filterForm.startDate}
                onChange={handleFilterChange}
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="form-label">
                Sampai Tanggal
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filterForm.endDate}
                onChange={handleFilterChange}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="secondary" onClick={clearFilters}>
              Reset Filter
            </Button>
            <Button onClick={applyFilters}>
              Terapkan Filter
            </Button>
          </div>
        </Card>
      )}

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Belum Ada Transaksi
          </h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters
              ? 'Tidak ada transaksi yang sesuai dengan filter yang dipilih'
              : 'Tambahkan transaksi pertama Anda untuk mulai melacak keuangan'}
          </p>
          {hasActiveFilters ? (
            <Button variant="secondary" onClick={clearFilters}>
              Reset Filter
            </Button>
          ) : (
            <Button onClick={handleAddClick}>Tambah Transaksi</Button>
          )}
        </div>
      ) : (
        <div>
          <div className="space-y-2">
            {transactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
          
          {renderPagination()}
        </div>
      )}

      {/* Modal tambah transaksi */}
      <Modal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title="Tambah Transaksi Baru"
        showFooter={false}
      >
        <TransactionForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Modal edit transaksi */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaksi"
        showFooter={false}
      >
        <TransactionForm
          transaction={editingTransaction}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        isOpen={!!deleteConfirmTransaction}
        onClose={() => setDeleteConfirmTransaction(null)}
        title="Hapus Transaksi"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        confirmVariant="danger"
      >
        <p>
          Apakah Anda yakin ingin menghapus transaksi "
          <strong>{deleteConfirmTransaction?.description}</strong>"?
        </p>
        <p className="mt-2 text-sm text-red-600">
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
};

export default TransactionList;