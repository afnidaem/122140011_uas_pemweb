import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import logo from '../../assets/logo-MoneyMate.svg';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="MoneyMate-logo" className="h-28 w-auto" />
              </Link>
            </div>
          </div>

          {/* Menu untuk desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Dashboard
                </Link>
                <Link
                  to="/wallets"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Dompet
                </Link>
                <Link
                  to="/transactions"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Transaksi
                </Link>
                <div className="relative ml-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-700">
                      {currentUser?.name}
                    </div>
                    <Link
                      to="/profile"
                      className="p-1 rounded-full text-gray-600 hover:text-primary-600"
                    >
                      <FiUser className="h-6 w-6" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-1 rounded-full text-gray-600 hover:text-primary-600"
                    >
                      <FiLogOut className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Tombol menu untuk mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/wallets"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dompet
                </Link>
                <Link
                  to="/transactions"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Transaksi
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;