import { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useWallet } from './WalletContext';

// Initial state
const initialState = {
  transactions: [],
  transaction: null,
  loading: false,
  error: null,
  filters: {
    walletId: null,
    startDate: null,
    endDate: null,
    type: null, // 'income' atau 'expense'
    searchQuery: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  },
};

// Action types
const FETCH_TRANSACTIONS_REQUEST = 'FETCH_TRANSACTIONS_REQUEST';
const FETCH_TRANSACTIONS_SUCCESS = 'FETCH_TRANSACTIONS_SUCCESS';
const FETCH_TRANSACTIONS_FAILURE = 'FETCH_TRANSACTIONS_FAILURE';
const FETCH_TRANSACTION_REQUEST = 'FETCH_TRANSACTION_REQUEST';
const FETCH_TRANSACTION_SUCCESS = 'FETCH_TRANSACTION_SUCCESS';
const FETCH_TRANSACTION_FAILURE = 'FETCH_TRANSACTION_FAILURE';
const ADD_TRANSACTION_REQUEST = 'ADD_TRANSACTION_REQUEST';
const ADD_TRANSACTION_SUCCESS = 'ADD_TRANSACTION_SUCCESS';
const ADD_TRANSACTION_FAILURE = 'ADD_TRANSACTION_FAILURE';
const UPDATE_TRANSACTION_REQUEST = 'UPDATE_TRANSACTION_REQUEST';
const UPDATE_TRANSACTION_SUCCESS = 'UPDATE_TRANSACTION_SUCCESS';
const UPDATE_TRANSACTION_FAILURE = 'UPDATE_TRANSACTION_FAILURE';
const DELETE_TRANSACTION_REQUEST = 'DELETE_TRANSACTION_REQUEST';
const DELETE_TRANSACTION_SUCCESS = 'DELETE_TRANSACTION_SUCCESS';
const DELETE_TRANSACTION_FAILURE = 'DELETE_TRANSACTION_FAILURE';
const SET_FILTERS = 'SET_FILTERS';
const SET_PAGINATION = 'SET_PAGINATION';
const CLEAR_ERROR = 'CLEAR_ERROR';
const RESET_TRANSACTION = 'RESET_TRANSACTION';

// Reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case FETCH_TRANSACTIONS_REQUEST:
      return { ...state, loading: true, error: null };
    
    case FETCH_TRANSACTIONS_SUCCESS:
      // Enhanced safety checks for API response structure
      const responseData = action.payload || {};
      let transactions = [];
      
      // Handle different possible response structures
      if (Array.isArray(responseData.data)) {
        transactions = responseData.data;
      } else if (Array.isArray(responseData.items)) {
        transactions = responseData.items;
      } else if (Array.isArray(responseData.transactions)) {
        transactions = responseData.transactions;
      } else if (Array.isArray(responseData)) {
        transactions = responseData;
      }
      
      // Ensure each transaction has proper structure and safe values
      transactions = transactions.map(transaction => ({
        ...transaction,
        id: transaction.id || transaction._id,
        amount: parseFloat(transaction.amount) || 0,
        type: transaction.type || 'expense',
        description: transaction.description || '',
        date: transaction.date || new Date().toISOString(),
        walletId: transaction.walletId || transaction.wallet_id,
      }));
      
      const totalItems = responseData.totalItems || responseData.total || responseData.count || transactions.length;
      const totalPages = responseData.totalPages || Math.ceil(totalItems / state.pagination.limit);
      
      return {
        ...state,
        loading: false,
        transactions,
        pagination: {
          ...state.pagination,
          totalItems,
          totalPages,
        },
        error: null,
      };
    
    case FETCH_TRANSACTIONS_FAILURE:
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        transactions: Array.isArray(state.transactions) ? state.transactions : []
      };

    // Fetch single transaction actions
    case FETCH_TRANSACTION_REQUEST:
      return { ...state, loading: true, error: null };
    
    case FETCH_TRANSACTION_SUCCESS:
      const singleTransaction = {
        ...action.payload,
        id: action.payload.id || action.payload._id,
        amount: parseFloat(action.payload.amount) || 0,
        type: action.payload.type || 'expense',
        description: action.payload.description || '',
        date: action.payload.date || new Date().toISOString(),
        walletId: action.payload.walletId || action.payload.wallet_id,
      };
      return { ...state, loading: false, transaction: singleTransaction, error: null };

    case FETCH_TRANSACTION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Add transaction actions
    case ADD_TRANSACTION_REQUEST:
      return { ...state, loading: true, error: null };
    
    case ADD_TRANSACTION_SUCCESS:
      const currentTransactions = Array.isArray(state.transactions) ? state.transactions : [];
      const newTransaction = {
        ...action.payload,
        id: action.payload.id || action.payload._id,
        amount: parseFloat(action.payload.amount) || 0,
        type: action.payload.type || 'expense',
        description: action.payload.description || '',
        date: action.payload.date || new Date().toISOString(),
        walletId: action.payload.walletId || action.payload.wallet_id,
      };
      
      return {
        ...state,
        loading: false,
        transactions: [newTransaction, ...currentTransactions],
        error: null,
      };

    case ADD_TRANSACTION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Update transaction actions
    case UPDATE_TRANSACTION_REQUEST:
      return { ...state, loading: true, error: null };
    
    case UPDATE_TRANSACTION_SUCCESS:
      const transactionsToUpdate = Array.isArray(state.transactions) ? state.transactions : [];
      const updatedTransaction = {
        ...action.payload,
        id: action.payload.id || action.payload._id,
        amount: parseFloat(action.payload.amount) || 0,
        type: action.payload.type || 'expense',
        description: action.payload.description || '',
        date: action.payload.date || new Date().toISOString(),
        walletId: action.payload.walletId || action.payload.wallet_id,
      };
      
      return {
        ...state,
        loading: false,
        transactions: transactionsToUpdate.map((transaction) =>
          (transaction.id === updatedTransaction.id || transaction._id === updatedTransaction.id) 
            ? updatedTransaction 
            : transaction
        ),
        transaction: (state.transaction?.id === updatedTransaction.id || state.transaction?._id === updatedTransaction.id)
          ? updatedTransaction
          : state.transaction,
        error: null,
      };

    case UPDATE_TRANSACTION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Delete transaction actions
    case DELETE_TRANSACTION_REQUEST:
      return { ...state, loading: true, error: null };
    
    case DELETE_TRANSACTION_SUCCESS:
      const transactionsToFilter = Array.isArray(state.transactions) ? state.transactions : [];
      const deletedId = action.payload;
      
      return {
        ...state,
        loading: false,
        transactions: transactionsToFilter.filter(
          (transaction) => transaction.id !== deletedId && transaction._id !== deletedId
        ),
        transaction: (state.transaction?.id === deletedId || state.transaction?._id === deletedId)
          ? null
          : state.transaction,
        error: null,
      };

    case DELETE_TRANSACTION_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    case SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }, // Reset page when filters change
      };
    
    case SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    
    case CLEAR_ERROR:
      return { ...state, error: null };

    case RESET_TRANSACTION:
      return { ...state, transaction: null, error: null };
    
    default:
      return {
        ...state,
        transactions: Array.isArray(state.transactions) ? state.transactions : []
      };
  }
};

// Create context
const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const { currentWallet } = useWallet();

  // Update filters when wallet changes
  useEffect(() => {
    if (currentWallet?.id) {
      setFilters({ walletId: currentWallet.id });
    }
  }, [currentWallet]);

  // Auto-fetch transactions when filters or pagination change
  useEffect(() => {
    if (state.filters.walletId) {
      fetchTransactions();
    }
  }, [state.filters.walletId, state.pagination.page, state.pagination.limit]);

  // Validate and sanitize amount input
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Jumlah harus berupa angka yang valid dan lebih besar dari 0');
    }
    return numAmount;
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    dispatch({ type: FETCH_TRANSACTIONS_REQUEST });
    try {
      const { page, limit } = state.pagination;
      const { walletId, startDate, endDate, type, searchQuery } = state.filters;

      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (walletId) params.append('walletId', walletId.toString());
      if (startDate) {
        const dateStr = startDate instanceof Date 
          ? startDate.toISOString().split('T')[0] 
          : startDate;
        params.append('startDate', dateStr);
      }
      if (endDate) {
        const dateStr = endDate instanceof Date 
          ? endDate.toISOString().split('T')[0] 
          : endDate;
        params.append('endDate', dateStr);
      }
      if (type && type !== '' && type !== 'all') params.append('type', type);
      if (searchQuery && searchQuery.trim() !== '') params.append('q', searchQuery.trim());

      console.log('Fetching transactions with params:', params.toString());

      const response = await axiosInstance.get('/transactions?${params.toString()}');
      
      console.log('Fetch transactions response:', response.data);
      
      dispatch({
        type: FETCH_TRANSACTIONS_SUCCESS,
        payload: response.data,
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Gagal memuat data transaksi';
      dispatch({
        type: FETCH_TRANSACTIONS_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch single transaction
  const fetchTransaction = async (id) => {
    if (!id) {
      const error = 'ID transaksi tidak valid';
      dispatch({ type: FETCH_TRANSACTION_FAILURE, payload: error });
      return { success: false, error };
    }

    dispatch({ type: FETCH_TRANSACTION_REQUEST });
    try {
      const response = await axiosInstance.get('/transactions/${id}');
      console.log('Fetch single transaction response:', response.data);
      
      dispatch({ type: FETCH_TRANSACTION_SUCCESS, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Gagal memuat detail transaksi';
      dispatch({
        type: FETCH_TRANSACTION_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    dispatch({ type: ADD_TRANSACTION_REQUEST });
    try {
      // Enhanced validation
      if (!transactionData.description?.trim()) {
        throw new Error('Deskripsi transaksi harus diisi');
      }
      if (!transactionData.type || !['income', 'expense'].includes(transactionData.type)) {
        throw new Error('Tipe transaksi harus dipilih (income atau expense)');
      }

      // Validate and sanitize amount
      const validAmount = validateAmount(transactionData.amount);

      // Get current wallet ID if not provided
      const walletId = transactionData.walletId || 
                      state.filters.walletId || 
                      currentWallet?.id;
      
      if (!walletId) {
        throw new Error('Wallet harus dipilih');
      }

      // Format date properly
      let transactionDate = transactionData.date;
      if (!transactionDate) {
        transactionDate = new Date().toISOString();
      } else if (transactionDate instanceof Date) {
        transactionDate = transactionDate.toISOString();
      }

      const formattedData = {
        description: transactionData.description.trim(),
        amount: validAmount,
        type: transactionData.type,
        walletId: parseInt(walletId),
        date: transactionDate,
        category: transactionData.category || null,
        notes: transactionData.notes?.trim() || null,
      };

      console.log('Adding transaction with data:', formattedData);

      const response = await axiosInstance.post('/transactions', formattedData);
      
      console.log('Transaction added successfully:', response.data);
      
      dispatch({ type: ADD_TRANSACTION_SUCCESS, payload: response.data });
      
      // Refresh transactions list after successful add
      await fetchTransactions();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to add transaction:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Gagal menambahkan transaksi';
      dispatch({
        type: ADD_TRANSACTION_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    if (!id) {
      const error = 'ID transaksi tidak valid';
      dispatch({ type: UPDATE_TRANSACTION_FAILURE, payload: error });
      return { success: false, error };
    }

    dispatch({ type: UPDATE_TRANSACTION_REQUEST });
    try {
      // Enhanced validation
      if (!transactionData.description?.trim()) {
        throw new Error('Deskripsi transaksi harus diisi');
      }
      if (!transactionData.type || !['income', 'expense'].includes(transactionData.type)) {
        throw new Error('Tipe transaksi harus dipilih (income atau expense)');
      }

      // Validate and sanitize amount
      const validAmount = validateAmount(transactionData.amount);

      // Format date properly
      let transactionDate = transactionData.date;
      if (transactionDate instanceof Date) {
        transactionDate = transactionDate.toISOString();
      }

      const formattedData = {
        description: transactionData.description.trim(),
        amount: validAmount,
        type: transactionData.type,
        date: transactionDate,
        category: transactionData.category || null,
        notes: transactionData.notes?.trim() || null,
      };

      console.log('Updating transaction with data:', formattedData);

      const response = await axiosInstance.put('/transactions/${id}', formattedData);
      
      console.log('Transaction updated successfully:', response.data);
      
      dispatch({ type: UPDATE_TRANSACTION_SUCCESS, payload: response.data });
      
      // Refresh transactions list after successful update
      await fetchTransactions();
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to update transaction:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Gagal mengupdate transaksi';
      dispatch({
        type: UPDATE_TRANSACTION_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!id) {
      const error = 'ID transaksi tidak valid';
      dispatch({ type: DELETE_TRANSACTION_FAILURE, payload: error });
      return { success: false, error };
    }

    dispatch({ type: DELETE_TRANSACTION_REQUEST });
    try {
      await axiosInstance.delete('/transactions/${id}');
      
      console.log('Transaction deleted successfully:', id);
      
      dispatch({ type: DELETE_TRANSACTION_SUCCESS, payload: id });
      
      // Refresh transactions list after successful delete
      await fetchTransactions();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Gagal menghapus transaksi';
      dispatch({
        type: DELETE_TRANSACTION_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: SET_FILTERS, payload: filters });
  };

  // Set pagination
  const setPagination = (pagination) => {
    dispatch({ type: SET_PAGINATION, payload: pagination });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  // Reset transaction
  const resetTransaction = () => {
    dispatch({ type: RESET_TRANSACTION });
  };

  // Calculate wallet balance from transactions
  const calculateBalance = () => {
    if (!Array.isArray(state.transactions)) return 0;
    
    return state.transactions.reduce((balance, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      return transaction.type === 'income' 
        ? balance + amount 
        : balance - amount;
    }, 0);
  };

  const value = {
    transactions: state.transactions,
    transaction: state.transaction,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    fetchTransactions,
    fetchTransaction,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    setPagination,
    clearError,
    resetTransaction,
    calculateBalance,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;