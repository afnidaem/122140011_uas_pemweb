import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Periksa apakah user sudah terautentikasi
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/auth/me');
        setCurrentUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to authenticate user:', err);
        setError('Sesi Anda telah berakhir. Silakan login kembali.');
        // Hapus token jika tidak valid
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const { token: authToken, user } = response.data;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setCurrentUser(user);
      setError(null);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(
        err.response?.data?.message || 'Login gagal. Silakan coba lagi.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
      });

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.'
      );
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;