import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { TransactionProvider } from './context/TransactionContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import WalletDetail from './pages/WalletDetail';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';

// Styles
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <TransactionProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* All routes are now public */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/wallets/:id" element={<WalletDetail />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/profile" element={<Profile />} />

              {/* Redirect unknown routes to Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TransactionProvider>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
