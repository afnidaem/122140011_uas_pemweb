import { createContext, useContext, useReducer, useEffect } from 'react';
import axiosInstance from '../api/axios';

// Initial state
const initialState = {
  wallets: [],
  currentWallet: null,
  loading: false,
  error: null,
  totalBalance: 0,
};

// Action types
const FETCH_WALLETS_REQUEST = 'FETCH_WALLETS_REQUEST';
const FETCH_WALLETS_SUCCESS = 'FETCH_WALLETS_SUCCESS';
const FETCH_WALLETS_FAILURE = 'FETCH_WALLETS_FAILURE';
const ADD_WALLET_REQUEST = 'ADD_WALLET_REQUEST';
const ADD_WALLET_SUCCESS = 'ADD_WALLET_SUCCESS';
const ADD_WALLET_FAILURE = 'ADD_WALLET_FAILURE';
const UPDATE_WALLET_REQUEST = 'UPDATE_WALLET_REQUEST';
const UPDATE_WALLET_SUCCESS = 'UPDATE_WALLET_SUCCESS';
const UPDATE_WALLET_FAILURE = 'UPDATE_WALLET_FAILURE';
const DELETE_WALLET_REQUEST = 'DELETE_WALLET_REQUEST';
const DELETE_WALLET_SUCCESS = 'DELETE_WALLET_SUCCESS';
const DELETE_WALLET_FAILURE = 'DELETE_WALLET_FAILURE';
const SET_CURRENT_WALLET = 'SET_CURRENT_WALLET';
const CLEAR_ERROR = 'CLEAR_ERROR';
const CALCULATE_TOTAL_BALANCE = 'CALCULATE_TOTAL_BALANCE';

// Reducer
const walletReducer = (state, action) => {
  switch (action.type) {
    case FETCH_WALLETS_REQUEST:
      return { ...state, loading: true, error: null };
    
    case FETCH_WALLETS_SUCCESS:
      const totalBalance = action.payload.reduce((sum, wallet) => 
        sum + (Number(wallet.saldo_awal) || Number(wallet.balance) || 0), 0
      );
      return {
        ...state,
        loading: false,
        wallets: action.payload,
        totalBalance,
        error: null,
      };
    
    case FETCH_WALLETS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    case ADD_WALLET_REQUEST:
      return { ...state, loading: true, error: null };
    
    case ADD_WALLET_SUCCESS:
      const newWallets = [...state.wallets, action.payload];
      const newTotalBalance = newWallets.reduce((sum, wallet) => 
        sum + (Number(wallet.saldo_awal) || Number(wallet.balance) || 0), 0
      );
      return {
        ...state,
        loading: false,
        wallets: newWallets,
        totalBalance: newTotalBalance,
        error: null,
      };
    
    case ADD_WALLET_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    case UPDATE_WALLET_REQUEST:
      return { ...state, loading: true, error: null };
    
    case UPDATE_WALLET_SUCCESS:
      const updatedWallets = state.wallets.map((wallet) =>
        wallet.id === action.payload.id ? action.payload : wallet
      );
      const updatedTotalBalance = updatedWallets.reduce((sum, wallet) => 
        sum + (Number(wallet.saldo_awal) || Number(wallet.balance) || 0), 0
      );
      return {
        ...state,
        loading: false,
        wallets: updatedWallets,
        totalBalance: updatedTotalBalance,
        currentWallet:
          state.currentWallet?.id === action.payload.id
            ? action.payload
            : state.currentWallet,
        error: null,
      };
    
    case UPDATE_WALLET_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    case DELETE_WALLET_REQUEST:
      return { ...state, loading: true, error: null };
    
    case DELETE_WALLET_SUCCESS:
      const remainingWallets = state.wallets.filter((wallet) => wallet.id !== action.payload);
      const remainingTotalBalance = remainingWallets.reduce((sum, wallet) => 
        sum + (Number(wallet.saldo_awal) || Number(wallet.balance) || 0), 0
      );
      return {
        ...state,
        loading: false,
        wallets: remainingWallets,
        totalBalance: remainingTotalBalance,
        currentWallet:
          state.currentWallet?.id === action.payload
            ? null
            : state.currentWallet,
        error: null,
      };
    
    case DELETE_WALLET_FAILURE:
      return { ...state, loading: false, error: action.payload };
    
    case SET_CURRENT_WALLET:
      return { ...state, currentWallet: action.payload };
    
    case CLEAR_ERROR:
      return { ...state, error: null };
    
    case CALCULATE_TOTAL_BALANCE:
      const calculatedBalance = state.wallets.reduce((sum, wallet) => 
        sum + (Number(wallet.saldo_awal) || Number(wallet.balance) || 0), 0
      );
      return { ...state, totalBalance: calculatedBalance };
    
    default:
      return state;
  }
};

// Create context
const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Auto fetch wallets on component mount
  useEffect(() => {
    fetchWallets();
  }, []);

  // Helper function to transform wallet data for API
  const transformWalletForAPI = (walletData) => {
    return {
      nama_dompet: walletData.name || walletData.nama_dompet,
      deskripsi: walletData.description || walletData.deskripsi || '',
      saldo_awal: Number(walletData.balance || walletData.saldo_awal || 0),
      tipe_dompet: walletData.type || walletData.tipe_dompet || 'cash',
      warna: walletData.color || walletData.warna || '#3B82F6',
    };
  };

  // Helper function to transform wallet data from API
  const transformWalletFromAPI = (apiWallet) => {
    return {
      id: apiWallet.id,
      name: apiWallet.nama_dompet,
      description: apiWallet.deskripsi || '',
      balance: Number(apiWallet.saldo_awal || 0),
      type: apiWallet.tipe_dompet || 'cash',
      color: apiWallet.warna || '#3B82F6',
      createdAt: apiWallet.created_at,
      updatedAt: apiWallet.updated_at,
      // Keep original API fields as well for compatibility
      nama_dompet: apiWallet.nama_dompet,
      deskripsi: apiWallet.deskripsi,
      saldo_awal: apiWallet.saldo_awal,
      tipe_dompet: apiWallet.tipe_dompet,
      warna: apiWallet.warna,
    };
  };

  // Fetch wallets
  const fetchWallets = async () => {
    dispatch({ type: FETCH_WALLETS_REQUEST });
    
    try {
      const response = await axiosInstance.get('/wallets');
      
      // Handle different response structures
      let walletsData = [];
      if (response.data?.data) {
        walletsData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && Array.isArray(response.data)) {
        walletsData = response.data;
      }

      // Transform data from API format
      const transformedWallets = walletsData.map(transformWalletFromAPI);
      
      dispatch({ 
        type: FETCH_WALLETS_SUCCESS, 
        payload: transformedWallets 
      });
      
      return { success: true, data: transformedWallets };
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      const errorMsg = error?.response?.data?.message || 
                     error?.message || 
                     'Gagal memuat data dompet';
      
      dispatch({
        type: FETCH_WALLETS_FAILURE,
        payload: errorMsg,
      });
      
      return { success: false, error: errorMsg };
    }
  };

  // Add wallet
  const addWallet = async (walletData) => {
    // Validate required fields
    if (!walletData?.name || !walletData?.name.trim()) {
      const errorMsg = 'Nama dompet harus diisi';
      dispatch({ type: ADD_WALLET_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }

    dispatch({ type: ADD_WALLET_REQUEST });

    try {
      const payload = transformWalletForAPI(walletData);
      
      console.log('Sending wallet data to API:', payload);
      
      const response = await axiosInstance.post('/wallets', payload);
      
      // Handle response
      let createdWallet = null;
      if (response.data?.data) {
        createdWallet = response.data.data;
      } else if (response.data) {
        createdWallet = response.data;
      }

      if (!createdWallet) {
        throw new Error('No data returned from server');
      }

      const transformedWallet = transformWalletFromAPI(createdWallet);
      
      dispatch({ 
        type: ADD_WALLET_SUCCESS, 
        payload: transformedWallet 
      });
      
      console.log('Wallet added successfully:', transformedWallet);
      
      return { success: true, data: transformedWallet };
    } catch (error) {
      console.error('Failed to add wallet:', error);
      
      let errorMsg = 'Gagal menambahkan dompet';
      
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errorMsg = Object.values(errors).flat().join(', ');
      } else if (error?.message) {
        errorMsg = error.message;
      }

      dispatch({ type: ADD_WALLET_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  // Update wallet
  const updateWallet = async (id, walletData) => {
    if (!id) {
      const errorMsg = 'ID dompet tidak valid';
      dispatch({ type: UPDATE_WALLET_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }

    // Validate required fields
    if (!walletData?.name || !walletData?.name.trim()) {
      const errorMsg = 'Nama dompet harus diisi';
      dispatch({ type: UPDATE_WALLET_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }

    dispatch({ type: UPDATE_WALLET_REQUEST });

    try {
      const payload = transformWalletForAPI(walletData);
      
      console.log(`Updating wallet ${id} with data:`, payload);
      
      const response = await axiosInstance.put(`/wallets/${id}`, payload);
      
      // Handle response
      let updatedWallet = null;
      if (response.data?.data) {
        updatedWallet = response.data.data;
      } else if (response.data) {
        updatedWallet = response.data;
      }

      if (!updatedWallet) {
        throw new Error('No data returned from server');
      }

      const transformedWallet = transformWalletFromAPI(updatedWallet);
      
      dispatch({ 
        type: UPDATE_WALLET_SUCCESS, 
        payload: transformedWallet 
      });
      
      console.log('Wallet updated successfully:', transformedWallet);
      
      return { success: true, data: transformedWallet };
    } catch (error) {
      console.error('Failed to update wallet:', error);
      
      let errorMsg = 'Gagal mengupdate dompet';
      
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errorMsg = Object.values(errors).flat().join(', ');
      } else if (error?.message) {
        errorMsg = error.message;
      }

      dispatch({ type: UPDATE_WALLET_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }
  };

  // Delete wallet
  const deleteWallet = async (id) => {
    if (!id) {
      const errorMsg = 'ID dompet tidak valid';
      dispatch({ type: DELETE_WALLET_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
    }

    dispatch({ type: DELETE_WALLET_REQUEST });

    try {
      console.log(`Deleting wallet with ID: ${id}`);
      
      const response = await axiosInstance.delete(`/wallets/${id}`);
      
      console.log('Delete response:', response.data);
      
      dispatch({ 
        type: DELETE_WALLET_SUCCESS, 
        payload: id 
      });
      
      console.log('Wallet deleted successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      
      let errorMsg = 'Gagal menghapus dompet';
      
      if (error?.response?.status === 404) {
        errorMsg = 'Dompet tidak ditemukan';
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      dispatch({ type: DELETE_WALLET_FAILURE, payload: errorMsg });
      return { success: false, error: errorMsg };
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

  // Refresh wallets (alias for fetchWallets)
  const refreshWallets = fetchWallets;

  // Get wallet by ID
  const getWalletById = (id) => {
    return state.wallets.find(wallet => wallet.id === id) || null;
  };

  // Calculate total balance
  const calculateTotalBalance = () => {
    dispatch({ type: CALCULATE_TOTAL_BALANCE });
  };

  const value = {
    // State
    wallets: state.wallets,
    currentWallet: state.currentWallet,
    loading: state.loading,
    error: state.error,
    totalBalance: state.totalBalance,
    
    // Actions
    fetchWallets,
    addWallet,
    updateWallet,
    deleteWallet,
    setCurrentWallet,
    clearError,
    refreshWallets,
    getWalletById,
    calculateTotalBalance,
    
    // Computed values
    walletsCount: state.wallets.length,
    hasWallets: state.wallets.length > 0,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;