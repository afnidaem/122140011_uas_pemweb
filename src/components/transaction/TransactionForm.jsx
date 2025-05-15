import { useState, useEffect } from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';
import Button from '../common/Button';

const TransactionForm = ({ transaction = null, onSuccess, onCancel }) => {
  const { addTransaction, updateTransaction } = useTransaction();
  const { wallets } = useWallet();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'expense', // default: expense
    category: '',
    walletId: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    notes: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEditing = !!transaction;

  // Initialize categories based on transaction type
  const [categories, setCategories] = useState([]);
  
  // Kategori Pengeluaran
  const expenseCategories = [
    { value: 'food', label: 'Makanan & Minuman' },
    { value: 'transportation', label: 'Transportasi' },
    { value: 'shopping', label: 'Belanja' },
    { value: 'entertainment', label: 'Hiburan' },
    { value: 'bills', label: 'Tagihan & Utilitas' },
    { value: 'health', label: 'Kesehatan' },
    { value: 'education', label: 'Pendidikan' },
    { value: 'housing', label: 'Rumah' },
    { value: 'travel', label: 'Perjalanan' },
    { value: 'gift', label: 'Hadiah & Donasi' },
    { value: 'other', label: 'Lainnya' },
  ];
  
  // Kategori Pemasukan
  const incomeCategories = [
    { value: 'salary', label: 'Gaji' },
    { value: 'business', label: 'Bisnis' },
    { value: 'investment', label: 'Investasi' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'gift', label: 'Hadiah' },
    { value: 'refund', label: 'Pengembalian Dana' },
    { value: 'other', label: 'Lainnya' },
  ];

  // Set category options based on transaction type
  useEffect(() => {
    if (formData.type === 'expense') {
      setCategories(expenseCategories);
    } else {
      setCategories(incomeCategories);
    }
    
    // Reset category when type changes if not editing
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        category: ''
      }));
    }
  }, [formData.type]);

  // Set default wallet if not specified
  useEffect(() => {
    if (wallets.length > 0 && !formData.walletId) {
      setFormData(prev => ({
        ...prev,
        walletId: wallets[0].id
      }));
    }
  }, [wallets]);

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        type: transaction.type || 'expense',
        category: transaction.category || '',
        walletId: transaction.walletId || '',
        date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: transaction.notes || '',
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount.trim()) {
      newErrors.amount = 'Jumlah harus diisi';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Jumlah harus berupa angka positif';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi harus diisi';
    }
    
    if (formData.description.trim().length > 100) {
      newErrors.description = 'Deskripsi maksimal 100 karakter';
    }
    
    if (!formData.category) {
      newErrors.category = 'Kategori harus dipilih';
    }
    
    if (!formData.walletId) {
      newErrors.walletId = 'Dompet harus dipilih';
    }
    
    if (!formData.date) {
      newErrors.date = 'Tanggal harus diisi';
    }
    
    if (formData.notes.length > 500) {
      newErrors.notes = 'Catatan maksimal 500 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const transactionData = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      type: formData.type,
      category: formData.category,
      walletId: formData.walletId,
      date: formData.date,
      notes: formData.notes.trim(),
    };
    
    try {
      let result;
      
      if (isEditing) {
        result = await updateTransaction(transaction.id, transactionData);
      } else {
        result = await addTransaction(transactionData);
      }
      
      if (result.success) {
        onSuccess(result.data);
      } else {
        setErrors({ form: result.error });
      }
    } catch (error) {
      setErrors({ form: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {errors.form}
        </div>
      )}
      
      {/* Tipe Transaksi */}
      <div>
        <label className="form-label">Tipe Transaksi</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`py-2 px-4 rounded-md border text-center font-medium ${
              formData.type === 'expense'
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
          >
            Pengeluaran
          </button>
          
          <button
            type="button"
            className={`py-2 px-4 rounded-md border text-center font-medium ${
              formData.type === 'income'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
          >
            Pemasukan
          </button>
        </div>
      </div>
      
      {/* Jumlah */}
      <div>
        <label htmlFor="amount" className="form-label">
          Jumlah <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">Rp</span>
          </div>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={`form-input pl-9 ${errors.amount ? 'border-red-500' : ''}`}
            placeholder="0"
            min="0"
            step="1000"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
        )}
      </div>
      
      {/* Deskripsi */}
      <div>
        <label htmlFor="description" className="form-label">
          Deskripsi <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`form-input ${errors.description ? 'border-red-500' : ''}`}
          placeholder="Contoh: Belanja di Supermarket"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
      
      {/* Kategori */}
      <div>
        <label htmlFor="category" className="form-label">
          Kategori <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`form-input ${errors.category ? 'border-red-500' : ''}`}
        >
          <option value="">Pilih Kategori</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-500">{errors.category}</p>
        )}
      </div>
      
      {/* Dompet */}
      <div>
        <label htmlFor="walletId" className="form-label">
          Dompet <span className="text-red-500">*</span>
        </label>
        <select
          id="walletId"
          name="walletId"
          value={formData.walletId}
          onChange={handleChange}
          className={`form-input ${errors.walletId ? 'border-red-500' : ''}`}
        >
          <option value="">Pilih Dompet</option>
          {wallets.map(wallet => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </select>
        {errors.walletId && (
          <p className="mt-1 text-sm text-red-500">{errors.walletId}</p>
        )}
      </div>
      
      {/* Tanggal */}
      <div>
        <label htmlFor="date" className="form-label">
          Tanggal <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`form-input ${errors.date ? 'border-red-500' : ''}`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>
      
      {/* Catatan */}
      <div>
        <label htmlFor="notes" className="form-label">
          Catatan
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className={`form-input ${errors.notes ? 'border-red-500' : ''}`}
          placeholder="Catatan tambahan (opsional)"
        ></textarea>
        {errors.notes && (
          <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button
          type="submit"
          variant={formData.type === 'expense' ? 'danger' : 'success'}
          disabled={loading}
        >
          {loading
            ? 'Menyimpan...'
            : isEditing
            ? 'Perbarui Transaksi'
            : 'Tambah Transaksi'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;