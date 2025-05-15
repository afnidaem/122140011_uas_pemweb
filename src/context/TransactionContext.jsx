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
const FETCH_TRANSACTION_SUCCESS = 'FETCH_TRANSACTION_SUCCESS';
const ADD_TRANSACTION_SUCCESS = 'ADD_TRANSACTION_SUCCESS';
const UPDATE_TRANSACTION_SUCCESS = 'UPDATE_TRANSACTION_SUCCESS';
const DELETE_TRANSACTION_SUCCESS = 'DELETE_TRANSACTION_SUCCESS';
const SET_FILTERS = 'SET_FILTERS';
const SET_PAGINATION = 'SET_PAGINATION';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case FETCH_TRANSACTIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        transactions: action.payload.items,
        pagination: {
          ...state.pagination,
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
        },
        error: null,
      };
    case FETCH_TRANSACTIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_TRANSACTION_SUCCESS:
      return { ...state, transaction: action.payload, error: null };
    case ADD_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        error: null,
      };
    case UPDATE_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
        transaction:
          state.transaction?.id === action.payload.id
            ? action.payload
            : state.transaction,
        error: null,
      };
    case DELETE_TRANSACTION_SUCCESS:
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        ),
        transaction:
          state.transaction?.id === action.payload
            ? null
            : state.transaction,
        error: null,
      };
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
    default:
      return state;
  }
};

// Create context
const TransactionContext = createContext();

export const useTransaction = () => {
  return useContext(TransactionContext);
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const { currentWallet } = useWallet();

  // Update filters when wallet changes
  useEffect(() => {
    if (currentWallet) {
      setFilters({ walletId: currentWallet.id });
    }
  }, [currentWallet]);

  // Fetch transactions
  const fetchTransactions = async () => {
    dispatch({ type: FETCH_TRANSACTIONS_REQUEST });
    try {
      const { page, limit } = state.pagination;
      const { walletId, startDate, endDate, type, searchQuery } = state.filters;

      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (walletId) params.append('walletId', walletId);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (type) params.append('type', type);
      if (searchQuery) params.append('q', searchQuery);

      const response = await axiosInstance.get(`/transactions?${params}`);
      dispatch({
        type: FETCH_TRANSACTIONS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      dispatch({
        type: FETCH_TRANSACTIONS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal memuat data transaksi',
      });
    }
  };

  // Fetch single transaction
  const fetchTransaction = async (id) => {
    dispatch({ type: FETCH_TRANSACTIONS_REQUEST });
    try {
      const response = await axiosInstance.get(`/transactions/${id}`);
      dispatch({ type: FETCH_TRANSACTION_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      dispatch({
        type: FETCH_TRANSACTIONS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal memuat detail transaksi',
      });
    }
  };

  // Add transaction
  const addTransaction = async (transactionData) => {
    try {
      const response = await axiosInstance.post(
        '/transactions',
        transactionData
      );
      dispatch({ type: ADD_TRANSACTION_SUCCESS, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to add transaction:', error);
      dispatch({
        type: FETCH_TRANSACTIONS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal menambahkan data transaksi',
      });
      return {
        success: false,
        error:
          error.response?.data?.message || 'Gagal menambahkan data transaksi',
      };
    }
  };

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await axiosInstance.put(
        `/transactions/${id}`,
        transactionData
      );
      dispatch({ type: UPDATE_TRANSACTION_SUCCESS, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to update transaction:', error);
      dispatch({
        type: FETCH_TRANSACTIONS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal mengupdate data transaksi',
      });
      return {
        success: false,
        error:
          error.response?.data?.message || 'Gagal mengupdate data transaksi',
      };
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      await axiosInstance.delete(`/transactions/${id}`);
      dispatch({ type: DELETE_TRANSACTION_SUCCESS, payload: id });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      dispatch({
        type: FETCH_TRANSACTIONS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal menghapus data transaksi',
      });
      return {
        success: false,
        error:
          error.response?.data?.message || 'Gagal menghapus data transaksi',
      };
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
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;