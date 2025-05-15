import { useState } from 'react';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';

const WalletItem = ({ wallet, onEdit, onDelete, onClick }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleOptionsClick = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowOptions(false);
    onEdit(wallet);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowOptions(false);
    onDelete(wallet);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    if (showOptions) {
      setShowOptions(false);
    }
  };

  // Add event listener when dropdown is shown
  useState(() => {
    if (showOptions) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptions]);

  // Wallet type icon mapping
  const getWalletIcon = (type) => {
    switch (type) {
      case 'cash':
        return '💵';
      case 'bank':
        return '🏦';
      case 'e-wallet':
        return '📱';
      case 'investment':
        return '📈';
      default:
        return '💼';
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={() => onClick(wallet)}
    >
      <div className="absolute top-3 right-3">
        <button
          className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          onClick={handleOptionsClick}
        >
          <FiMoreVertical />
        </button>
        {showOptions && (
          <div className="absolute right-0 mt-1 py-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <button
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              onClick={handleEditClick}
            >
              <FiEdit2 className="mr-2" /> Edit
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              onClick={handleDeleteClick}
            >
              <FiTrash2 className="mr-2" /> Hapus
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-xl"
          style={{ backgroundColor: wallet.color, color: '#ffffff' }}
        >
          {getWalletIcon(wallet.type)}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{wallet.name}</h3>
          <p className="text-sm text-gray-500">
            {wallet.type === 'cash'
              ? 'Uang Tunai'
              : wallet.type === 'bank'
              ? 'Rekening Bank'
              : wallet.type === 'e-wallet'
              ? 'E-Wallet'
              : wallet.type === 'investment'
              ? 'Investasi'
              : 'Lainnya'}
          </p>
        </div>
      </div>

      {wallet.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {wallet.description}
        </p>
      )}

      <div className="border-t border-gray-100 pt-3">
        <div className="text-lg font-semibold text-gray-900">
          {formatCurrency(wallet.balance)}
        </div>
        <p className="text-xs text-gray-500">Saldo saat ini</p>
      </div>
    </div>
  );
};

export default WalletItem;