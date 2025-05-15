import { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  wallets: [],
  currentWallet: null,
  loading: false,
  error: null,
};

// Action types
const FETCH_WALLETS_REQUEST = 'FETCH_WALLETS_REQUEST';
const FETCH_WALLETS_SUCCESS = 'FETCH_WALLETS_SUCCESS';
const FETCH_WALLETS_FAILURE = 'FETCH_WALLETS_FAILURE';
const ADD_WALLET_SUCCESS = 'ADD_WALLET_SUCCESS';
const UPDATE_WALLET_SUCCESS = 'UPDATE_WALLET_SUCCESS';
const DELETE_WALLET_SUCCESS = 'DELETE_WALLET_SUCCESS';
const SET_CURRENT_WALLET = 'SET_CURRENT_WALLET';
const CLEAR_ERROR = 'CLEAR_ERROR';

// Reducer
const walletReducer = (state, action) => {
  switch (action.type) {
    case FETCH_WALLETS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_WALLETS_SUCCESS:
      return {
        ...state,
        loading: false,
        wallets: action.payload,
        error: null,
      };
    case FETCH_WALLETS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ADD_WALLET_SUCCESS:
      return {
        ...state,
        wallets: [...state.wallets, action.payload],
        error: null,
      };
    case UPDATE_WALLET_SUCCESS:
      return {
        ...state,
        wallets: state.wallets.map((wallet) =>
          wallet.id === action.payload.id ? action.payload : wallet
        ),
        currentWallet:
          state.currentWallet?.id === action.payload.id
            ? action.payload
            : state.currentWallet,
        error: null,
      };
    case DELETE_WALLET_SUCCESS:
      return {
        ...state,
        wallets: state.wallets.filter((wallet) => wallet.id !== action.payload),
        currentWallet:
          state.currentWallet?.id === action.payload
            ? null
            : state.currentWallet,
        error: null,
      };
    case SET_CURRENT_WALLET:
      return { ...state, currentWallet: action.payload };
    case CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const WalletContext = createContext();

export const useWallet = () => {
  return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallets();
    }
  }, [isAuthenticated]);

  // Fetch wallets
  const fetchWallets = async () => {
    dispatch({ type: FETCH_WALLETS_REQUEST });
    try {
      const response = await axiosInstance.get('/wallets');
      dispatch({ type: FETCH_WALLETS_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      dispatch({
        type: FETCH_WALLETS_FAILURE,
        payload: error.response?.data?.message || 'Gagal memuat data dompet',
      });
    }
  };

  // Add wallet
  const addWallet = async (walletData) => {
    try {
      const response = await axiosInstance.post('/wallets', walletData);
      dispatch({ type: ADD_WALLET_SUCCESS, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to add wallet:', error);
      dispatch({
        type: FETCH_WALLETS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal menambahkan data dompet',
      });
      return {
        success: false,
        error: error.response?.data?.message || 'Gagal menambahkan data dompet',
      };
    }
  };

  // Update wallet
  const updateWallet = async (id, walletData) => {
    try {
      const response = await axiosInstance.put(`/wallets/${id}`, walletData);
      dispatch({ type: UPDATE_WALLET_SUCCESS, payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to update wallet:', error);
      dispatch({
        type: FETCH_WALLETS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal mengupdate data dompet',
      });
      return {
        success: false,
        error:
          error.response?.data?.message || 'Gagal mengupdate data dompet',
      };
    }
  };

  // Delete wallet
  const deleteWallet = async (id) => {
    try {
      await axiosInstance.delete(`/wallets/${id}`);
      dispatch({ type: DELETE_WALLET_SUCCESS, payload: id });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      dispatch({
        type: FETCH_WALLETS_FAILURE,
        payload:
          error.response?.data?.message || 'Gagal menghapus data dompet',
      });
      return {
        success: false,
        error:
          error.response?.data?.message || 'Gagal menghapus data dompet',
      };
    }
  };

  // Set current wallet
  const setCurrentWallet = (wallet) => {
    dispatch({ type: SET_CURRENT_WALLET, payload: wallet });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  const value = {
    wallets: state.wallets,
    currentWallet: state.currentWallet,
    loading: state.loading,
    error: state.error,
    fetchWallets,
    addWallet,
    updateWallet,
    deleteWallet,
    setCurrentWallet,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export default WalletContext;