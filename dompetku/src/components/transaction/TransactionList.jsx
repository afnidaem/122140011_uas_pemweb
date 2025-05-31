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
    refreshTransactions,
  } = useTransaction();
  
  const { wallets, loading: walletsLoading } = useWallet();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmTransaction, setDeleteConfirmTransaction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterForm, setFilterForm] = useState({
    searchQuery: filters?.searchQuery || '',
    walletId: filters?.walletId || '',
    type: filters?.type || '',
    startDate: filters?.startDate || '',
    endDate: filters?.endDate || '',
  });

  // Fetch transactions when component mounts or filters/pagination change
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await fetchTransactions();
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    loadTransactions();
  }, [filters, pagination?.page, pagination?.limit]);

  // Update filter form when filters change from context
  useEffect(() => {
    if (filters) {
      setFilterForm({
        searchQuery: filters.searchQuery || '',
        walletId: filters.walletId || '',
        type: filters.type || '',
        startDate: filters.startDate ? formatDateForInput(filters.startDate) : '',
        endDate: filters.endDate ? formatDateForInput(filters.endDate) : '',
      });
    }
  }, [filters]);

  // Helper function to format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Calculate stats with better error handling
  const stats = {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  };

  if (Array.isArray(transactions)) {
    stats.totalIncome = transactions
      .filter(t => t?.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    stats.totalExpense = transactions
      .filter(t => t?.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    stats.balance = stats.totalIncome - stats.totalExpense;
  }

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDeleteClick = (transaction) => {
    setDeleteConfirmTransaction(transaction);
  };

  const handleFormSuccess = async () => {
    setShowAddModal(false);
    setEditingTransaction(null);
    
    // Refresh transactions after successful form submission
    try {
      await refreshTransactions();
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      // Still close modal even if refresh fails
    }
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTransaction) return;

    setDeleteLoading(true);
    try {
      const result = await deleteTransaction(deleteConfirmTransaction.id);
      
      if (result?.success) {
        setDeleteConfirmTransaction(null);
        // Refresh transactions after successful deletion
        await refreshTransactions();
      } else {
        // Handle deletion failure
        console.error('Delete failed:', result?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setDeleteLoading(false);
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
    const newFilters = {
      searchQuery: filterForm.searchQuery.trim(),
      walletId: filterForm.walletId || null,
      type: filterForm.type || null,
      startDate: filterForm.startDate ? new Date(filterForm.startDate) : null,
      endDate: filterForm.endDate ? new Date(filterForm.endDate) : null,
    };

    setFilters(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const emptyFilters = {
      searchQuery: '',
      walletId: '',
      type: '',
      startDate: '',
      endDate: '',
    };
    
    setFilterForm(emptyFilters);
    setFilters({
      searchQuery: '',
      walletId: null,
      type: null,
      startDate: null,
      endDate: null,
    });
    setShowFilters(false);
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    handleFilterChange(e);
    
    // Debounce search to avoid too many API calls
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setFilters({
        ...filters,
        searchQuery: searchValue.trim(),
      });
    }, 500);
  };

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > (pagination?.totalPages || 1)) return;
    setPagination({ page: newPage });
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    const { page, totalPages, totalItems, limit } = pagination;
    const startItem = ((page - 1) * limit) + 1;
    const endItem = Math.min(page * limit, totalItems);
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
        <div className="text-sm text-gray-700">
          Menampilkan {startItem}-{endItem} dari {totalItems} transaksi
        </div>
        
        <div className="flex items-center space-x-2">
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
      </div>
    );
  };

  // Loading state
  if (loading && (!transactions || transactions.length === 0)) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
        <p className="mt-2 text-gray-600">Memuat transaksi...</p>
      </div>
    );
  }

  // Error state
  if (error && (!transactions || transactions.length === 0)) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
        <p className="font-medium">Gagal memuat transaksi</p>
        <p className="text-sm mt-1">{error}</p>
        <div className="mt-3">
          <Button variant="outline" onClick={() => {
            clearError();
            fetchTransactions();
          }}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = 
    filters?.searchQuery ||
    filters?.walletId ||
    filters?.type ||
    filters?.startDate ||
    filters?.endDate;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border border-green-200">
          <div className="text-green-600 font-medium">Total Pemasukan</div>
          <div className="text-2xl font-bold text-green-700 mt-2">
            {formatCurrency(stats.totalIncome)}
          </div>
        </Card>
        
        <Card className="bg-red-50 border border-red-200">
          <div className="text-red-600 font-medium">Total Pengeluaran</div>
          <div className="text-2xl font-bold text-red-700 mt-2">
            {formatCurrency(stats.totalExpense)}
          </div>
        </Card>
        
        <Card className={`${stats.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border`}>
          <div className={`${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'} font-medium`}>
            Saldo
          </div>
          <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-blue-700' : 'text-orange-700'} mt-2`}>
            {formatCurrency(stats.balance)}
          </div>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={filterForm.searchQuery}
            onChange={handleSearchChange}
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
            <FiFilter className="mr-1" /> 
            {hasActiveFilters ? 'Filter Aktif' : 'Filter'}
          </Button>
          
          <Button 
            onClick={handleAddClick} 
            className="flex items-center"
            disabled={walletsLoading || (wallets && wallets.length === 0)}
          >
            <FiPlus className="mr-1" /> Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* No wallets warning */}
      {wallets && wallets.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
          <p className="font-medium">Belum ada dompet</p>
          <p className="text-sm mt-1">Anda perlu membuat dompet terlebih dahulu sebelum menambah transaksi.</p>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border border-gray-200">
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
                disabled={walletsLoading}
              >
                <option value="">Semua Dompet</option>
                {Array.isArray(wallets) && wallets.map(wallet => (
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
                min={filterForm.startDate}
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
      {!transactions || transactions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasActiveFilters ? 'Tidak Ada Hasil' : 'Belum Ada Transaksi'}
          </h3>
          <p className="text-gray-600 mb-4">
            {hasActiveFilters
              ? 'Tidak ada transaksi yang sesuai dengan filter yang dipilih. Coba ubah kriteria pencarian.'
              : 'Tambahkan transaksi pertama Anda untuk mulai melacak keuangan'}
          </p>
          {hasActiveFilters ? (
            <Button variant="secondary" onClick={clearFilters}>
              Reset Filter
            </Button>
          ) : wallets && wallets.length > 0 ? (
            <Button onClick={handleAddClick}>Tambah Transaksi</Button>
          ) : null}
        </div>
      ) : (
        <div>
          <div className="space-y-3">
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

      {/* Loading overlay for updates */}
      {loading && transactions && transactions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-primary-600 mr-3"></div>
            Memperbarui data...
          </div>
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
        <div>
          <p>
            Apakah Anda yakin ingin menghapus transaksi "
            <strong>{deleteConfirmTransaction?.description}</strong>"?
          </p>
          <p className="mt-2 text-sm text-red-600">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionList;