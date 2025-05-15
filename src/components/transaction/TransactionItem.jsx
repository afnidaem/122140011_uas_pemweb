import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatRelative } from '../../utils/dateFormatter';

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  // Kategori Pengeluaran
  const expenseCategories = {
    food: { label: 'Makanan & Minuman', icon: '🍔' },
    transportation: { label: 'Transportasi', icon: '🚗' },
    shopping: { label: 'Belanja', icon: '🛍️' },
    entertainment: { label: 'Hiburan', icon: '🎬' },
    bills: { label: 'Tagihan & Utilitas', icon: '📱' },
    health: { label: 'Kesehatan', icon: '💊' },
    education: { label: 'Pendidikan', icon: '📚' },
    housing: { label: 'Rumah', icon: '🏠' },
    travel: { label: 'Perjalanan', icon: '✈️' },
    gift: { label: 'Hadiah & Donasi', icon: '🎁' },
    other: { label: 'Lainnya', icon: '📦' },
  };
  
  // Kategori Pemasukan
  const incomeCategories = {
    salary: { label: 'Gaji', icon: '💰' },
    business: { label: 'Bisnis', icon: '💼' },
    investment: { label: 'Investasi', icon: '📈' },
    bonus: { label: 'Bonus', icon: '🎉' },
    gift: { label: 'Hadiah', icon: '🎁' },
    refund: { label: 'Pengembalian Dana', icon: '💸' },
    other: { label: 'Lainnya', icon: '📦' },
  };

  const getCategoryData = () => {
    const categories = transaction.type === 'expense' ? expenseCategories : incomeCategories;
    return categories[transaction.category] || { label: 'Lainnya', icon: '📦' };
  };

  const categoryData = getCategoryData();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-2 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
            transaction.type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
          }`}>
            {categoryData.icon}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">{transaction.description}</h3>
            <div className="flex items-center text-sm text-gray-500 space-x-2">
              <span>{categoryData.label}</span>
              <span>•</span>
              <span>{transaction.wallet?.name || 'Dompet'}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`font-semibold ${
            transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
          }`}>
            {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
          </div>
          <div className="text-xs text-gray-500">
            {formatRelative(transaction.date)}
          </div>
        </div>
      </div>

      {transaction.notes && (
        <div className="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
          {transaction.notes}
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(transaction)}
          className="text-gray-500 hover:text-primary-600 p-1"
          title="Edit"
        >
          <FiEdit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(transaction)}
          className="text-gray-500 hover:text-red-600 p-1"
          title="Hapus"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;