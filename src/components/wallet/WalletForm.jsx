import { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import Button from '../common/Button';

const WalletForm = ({ wallet = null, onSuccess, onCancel }) => {
  const { addWallet, updateWallet } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    balance: '',
    type: 'cash', // default: cash
    color: '#3b82f6', // default: blue
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const isEditing = !!wallet;

  useEffect(() => {
    if (wallet) {
      setFormData({
        name: wallet.name || '',
        description: wallet.description || '',
        balance: wallet.balance?.toString() || '',
        type: wallet.type || 'cash',
        color: wallet.color || '#3b82f6',
      });
    }
  }, [wallet]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Reset error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama dompet harus diisi';
    }
    
    if (formData.name.trim().length > 50) {
      newErrors.name = 'Nama dompet maksimal 50 karakter';
    }
    
    if (formData.description.trim().length > 200) {
      newErrors.description = 'Deskripsi maksimal 200 karakter';
    }
    
    if (!formData.balance.trim()) {
      newErrors.balance = 'Saldo awal harus diisi';
    } else if (isNaN(formData.balance) || parseFloat(formData.balance) < 0) {
      newErrors.balance = 'Saldo harus berupa angka positif';
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
    
    const walletData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      balance: parseFloat(formData.balance),
      type: formData.type,
      color: formData.color,
    };
    
    try {
      let result;
      
      if (isEditing) {
        result = await updateWallet(wallet.id, walletData);
      } else {
        result = await addWallet(walletData);
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

  const walletTypes = [
    { value: 'cash', label: 'Uang Tunai' },
    { value: 'bank', label: 'Rekening Bank' },
    { value: 'e-wallet', label: 'E-Wallet' },
    { value: 'investment', label: 'Investasi' },
    { value: 'other', label: 'Lainnya' },
  ];

  const colorOptions = [
    { value: '#3b82f6', label: 'Biru' },
    { value: '#10b981', label: 'Hijau' },
    { value: '#ef4444', label: 'Merah' },
    { value: '#f59e0b', label: 'Oranye' },
    { value: '#8b5cf6', label: 'Ungu' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#6b7280', label: 'Abu-abu' },
    { value: '#000000', label: 'Hitam' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {errors.form}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="form-label">
          Nama Dompet <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'border-red-500' : ''}`}
          placeholder="Contoh: Dompet Pribadi, BCA, DANA, dll."
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="form-label">
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="2"
          className={`form-input ${errors.description ? 'border-red-500' : ''}`}
          placeholder="Deskripsi singkat tentang dompet ini (opsional)"
        ></textarea>
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="balance" className="form-label">
          Saldo Awal <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="balance"
          name="balance"
          value={formData.balance}
          onChange={handleChange}
          className={`form-input ${errors.balance ? 'border-red-500' : ''}`}
          placeholder="0"
          min="0"
          step="1000"
        />
        {errors.balance && (
          <p className="mt-1 text-sm text-red-500">{errors.balance}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="type" className="form-label">
          Tipe Dompet
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="form-input"
        >
          {walletTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="form-label">Warna</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {colorOptions.map((color) => (
            <div
              key={color.value}
              onClick={() =>
                setFormData((prev) => ({ ...prev, color: color.value }))
              }
              className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                formData.color === color.value
                  ? 'border-gray-900'
                  : 'border-gray-200'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? 'Menyimpan...'
            : isEditing
            ? 'Perbarui Dompet'
            : 'Tambah Dompet'}
        </Button>
      </div>
    </form>
  );
};

export default WalletForm;