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
  
  // Kategori Pengeluaran - DIPERBAIKI sesuai enum backend
  const expenseCategories = [
    { value: 'makanan_dan_minuman', label: 'Makanan & Minuman', id: 1 },
    { value: 'transport', label: 'Transportasi', id: 2 },
    { value: 'belanja', label: 'Belanja', id: 3 },
    { value: 'hiburan', label: 'Hiburan', id: 4 },
    { value: 'tagihan_dan_utilitas', label: 'Tagihan & Utilitas', id: 5 },
    { value: 'kesehatan', label: 'Kesehatan', id: 6 },
    { value: 'pendidikan', label: 'Pendidikan', id: 7 },
    { value: 'rumah', label: 'Rumah', id: 8 },
    { value: 'perjalanan', label: 'Perjalanan', id: 9 },
    { value: 'hadiah_dan_donasi', label: 'Hadiah & Donasi', id: 10 },
    { value: 'lainnya_expense', label: 'Lainnya', id: 11 },
  ];
  
  // Kategori Pemasukan - DIPERBAIKI sesuai enum backend
  const incomeCategories = [
    { value: 'gaji', label: 'Gaji', id: 12 },
    { value: 'bisnis', label: 'Bisnis', id: 13 },
    { value: 'investasi', label: 'Investasi', id: 14 },
    { value: 'bonus', label: 'Bonus', id: 15 },
    { value: 'hadiah', label: 'Hadiah', id: 16 },
    { value: 'piutang', label: 'Piutang/Pengembalian Dana', id: 17 },
    { value: 'lainnya_income', label: 'Lainnya', id: 18 },
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
  }, [formData.type, isEditing]);

  // Set default wallet if not specified
  useEffect(() => {
    if (wallets.length > 0 && !formData.walletId) {
      setFormData(prev => ({
        ...prev,
        walletId: wallets[0].id
      }));
    }
  }, [wallets, formData.walletId]);

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
    
    // Validate amount
    if (!formData.amount || formData.amount.toString().trim() === '') {
      newErrors.amount = 'Jumlah harus diisi';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Jumlah harus berupa angka positif';
      }
    }
    
    // Validate description
    if (!formData.description || String(formData.description).trim() === '') {
      newErrors.description = 'Deskripsi harus diisi';
    } else if (String(formData.description).trim().length > 100) {
      newErrors.description = 'Deskripsi maksimal 100 karakter';
    }
    
    // Validate category
    if (!formData.category || String(formData.category).trim() === '') {
      newErrors.category = 'Kategori harus dipilih';
    }
    
    // Validate walletId
    if (!formData.walletId || String(formData.walletId).trim() === '') {
      newErrors.walletId = 'Dompet harus dipilih';
    }
    
    // Validate date
    if (!formData.date || String(formData.date).trim() === '') {
      newErrors.date = 'Tanggal harus diisi';
    } else {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(String(formData.date))) {
        newErrors.date = 'Format tanggal tidak valid';
      }
    }
    
    // Validate notes (optional but has length limit)
    if (formData.notes && String(formData.notes).length > 500) {
      newErrors.notes = 'Catatan maksimal 500 karakter';
    }
    
    // Validate type
    if (!['expense', 'income'].includes(formData.type)) {
      newErrors.type = 'Tipe transaksi tidak valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareTransactionData = () => {
    // Clean and prepare data for API
    const amount = parseFloat(formData.amount);
    const description = String(formData.description || '').trim();
    const notes = formData.notes ? String(formData.notes).trim() : '';
    
    // Ensure date is in correct format for DateTime field
    let date = String(formData.date || '');
    if (date && !date.includes('T')) {
      // Add time to make it a proper datetime
      date = `${date}T00:00:00`;
    }
    
    // Get category_id from selected category
    const categoryId = getCategoryId(formData.category, formData.type);
    
    // Debug logging
    console.log('=== PREPARE TRANSACTION DATA ===');
    console.log('Form category:', formData.category);
    console.log('Form type:', formData.type);
    console.log('Resolved category_id:', categoryId);
    
    // Map frontend field names to server field names
    const transactionData = {
      jumlah: amount,                    // amount -> jumlah
      deskripsi: description,            // description -> deskripsi
      tipe_transaksi: formData.type,     // type -> tipe_transaksi
      category_id: categoryId,           // PERBAIKAN: pastikan category_id valid
      wallet_id: parseInt(formData.walletId), // walletId -> wallet_id (ensure integer)
      tanggal: date,                     // date -> tanggal
      catatan: notes || '',              // notes -> catatan (pastikan tidak null)
    };

    // Validation sebelum return
    if (!transactionData.category_id || transactionData.category_id === 0) {
      console.error('❌ CRITICAL: category_id tidak valid!', {
        original_category: formData.category,
        category_id: transactionData.category_id,
        type: formData.type
      });
      throw new Error('Category ID tidak valid');
    }

    console.log('Final transaction data:', transactionData);
    return transactionData;
  };

  // Helper function to map category string to category_id - DIPERBAIKI
  const getCategoryId = (categoryValue, transactionType) => {
    console.log('Getting category ID for:', categoryValue, 'type:', transactionType);
    
    if (!categoryValue) {
      console.error('Category value is empty!');
      return null;
    }
    
    // Cari category berdasarkan value dari array categories yang sesuai
    const currentCategories = transactionType === 'expense' ? expenseCategories : incomeCategories;
    const foundCategory = currentCategories.find(cat => cat.value === categoryValue);
    
    if (foundCategory) {
      console.log('Found category:', foundCategory);
      return foundCategory.id;
    }
    
    console.error('Category not found for value:', categoryValue);
    
    // Fallback mapping (untuk backward compatibility)
    if (transactionType === 'expense') {
      const categoryMap = {
        'food': 1,                      // Legacy mapping
        'makanan_dan_minuman': 1,       
        'transportation': 2,            // Legacy mapping
        'transport': 2,                 
        'shopping': 3,                  // Legacy mapping
        'belanja': 3,                   
        'entertainment': 4,             // Legacy mapping
        'hiburan': 4,                   
        'bills': 5,                     // Legacy mapping
        'tagihan_dan_utilitas': 5,      
        'health': 6,                    // Legacy mapping
        'kesehatan': 6,                 
        'education': 7,                 // Legacy mapping
        'pendidikan': 7,                
        'housing': 8,                   // Legacy mapping
        'rumah': 8,                     
        'travel': 9,                    // Legacy mapping
        'perjalanan': 9,                
        'gift': 10,                     // Legacy mapping
        'hadiah_dan_donasi': 10,        
        'other': 11,                    // Legacy mapping
        'lainnya': 11,                  
        'lainnya_expense': 11,          
      };
      return categoryMap[categoryValue] || 11; // default to 'lainnya'
    } else {
      const categoryMap = {
        'salary': 12,                   // Legacy mapping
        'gaji': 12,                     
        'business': 13,                 // Legacy mapping
        'bisnis': 13,                   
        'investment': 14,               // Legacy mapping
        'investasi': 14,                
        'bonus': 15,                    
        'gift': 16,                     // Legacy mapping
        'hadiah': 16,                   
        'refund': 17,                   // Legacy mapping
        'piutang': 17,                  
        'other': 18,                    // Legacy mapping
        'lainnya': 18,                  
        'lainnya_income': 18,           
      };
      return categoryMap[categoryValue] || 18; // default to 'lainnya'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous form errors
    if (errors.form) {
      setErrors(prev => ({ ...prev, form: null }));
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const transactionData = prepareTransactionData();
      
      console.log('Sending transaction data:', transactionData); // Debug log
      
      let result;
      
      if (isEditing) {
        result = await updateTransaction(transaction.id, transactionData);
      } else {
        result = await addTransaction(transactionData);
      }
      
      if (result && result.success) {
        // Reset form if adding new transaction
        if (!isEditing) {
          setFormData({
            amount: '',
            description: '',
            type: 'expense',
            category: '',
            walletId: wallets.length > 0 ? wallets[0].id : '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
          });
        }
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        const errorMessage = result?.error || result?.message || 'Terjadi kesalahan saat menyimpan transaksi';
        setErrors({ form: errorMessage });
      }
    } catch (error) {
      console.error('Transaction form error:', error); // Debug log
      
      let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ form: errorMessage });
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
            className={`py-2 px-4 rounded-md border text-center font-medium transition-colors ${
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
            className={`py-2 px-4 rounded-md border text-center font-medium transition-colors ${
              formData.type === 'income'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
          >
            Pemasukan
          </button>
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-red-500">{errors.type}</p>
        )}
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
          maxLength="100"
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
        
        {/* Debug info - bisa dihapus nanti */}
        {process.env.NODE_ENV === 'development' && formData.category && (
          <p className="mt-1 text-xs text-gray-500">
            Debug: {formData.category} → ID: {getCategoryId(formData.category, formData.type)}
          </p>
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
          maxLength="500"
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