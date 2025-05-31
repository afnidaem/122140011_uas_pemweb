import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import WalletItem from './WalletItem';
import Button from '../common/Button';
import Modal from '../common/Modal';
import WalletForm from './WalletForm';
import { FiPlus } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';

const WalletList = ({ onWalletSelect }) => {
  const { wallets, loading, error, deleteWallet } = useWallet();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [deleteConfirmWallet, setDeleteConfirmWallet] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Total saldo dari semua dompet
  const totalBalance = wallets.reduce(
    (total, wallet) => total + wallet.balance,
    0
  );

  const handleAddClick = () => {
    setShowAddModal(true);
  };

  const handleEditClick = (wallet) => {
    setEditingWallet(wallet);
  };

  const handleDeleteClick = (wallet) => {
    setDeleteConfirmWallet(wallet);
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    setEditingWallet(null);
  };

  const handleFormCancel = () => {
    setShowAddModal(false);
    setEditingWallet(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmWallet) return;

    setDeleteLoading(true);
    const result = await deleteWallet(deleteConfirmWallet.id);
    setDeleteLoading(false);

    if (result.success) {
      setDeleteConfirmWallet(null);
    }
  };

  if (loading && wallets.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
        <p className="mt-2 text-gray-600">Memuat dompet...</p>
      </div>
    );
  }

  if (error && wallets.length === 0) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>Gagal memuat dompet: {error}</p>
        <Button variant="outline" className="mt-2">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Informasi total saldo */}
      <div className="bg-primary-50 p-4 rounded-lg mb-6">
        <p className="text-primary-800 font-medium">Total Aset</p>
        <h2 className="text-2xl font-bold text-primary-900 mt-1">
          {formatCurrency(totalBalance)}
        </h2>
        <p className="text-primary-700 text-sm mt-1">
          Dari {wallets.length} dompet
        </p>
      </div>

      {/* Tombol tambah dompet */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Dompet</h2>
        <Button onClick={handleAddClick} className="flex items-center">
          <FiPlus className="mr-1" /> Tambah Dompet
        </Button>
      </div>

      {/* Daftar dompet */}
      {wallets.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">💼</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Belum Ada Dompet
          </h3>
          <p className="text-gray-600 mb-4">
            Tambahkan dompet pertama Anda untuk mulai melacak keuangan
          </p>
          <Button onClick={handleAddClick}>Tambah Dompet</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <WalletItem
              key={wallet.id}
              wallet={wallet}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onClick={onWalletSelect}
            />
          ))}
        </div>
      )}

      {/* Modal tambah dompet */}
      <Modal
        isOpen={showAddModal}
        onClose={handleFormCancel}
        title="Tambah Dompet Baru"
        showFooter={false}
      >
        <WalletForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </Modal>

      {/* Modal edit dompet */}
      <Modal
        isOpen={!!editingWallet}
        onClose={() => setEditingWallet(null)}
        title="Edit Dompet"
        showFooter={false}
      >
        <WalletForm
          wallet={editingWallet}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        isOpen={!!deleteConfirmWallet}
        onClose={() => setDeleteConfirmWallet(null)}
        title="Hapus Dompet"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        confirmVariant="danger"
      >
        <p>
          Apakah Anda yakin ingin menghapus dompet "
          <strong>{deleteConfirmWallet?.name}</strong>"?
        </p>
        <p className="mt-2 text-sm text-red-600">
          Semua transaksi yang terkait dengan dompet ini juga akan dihapus.
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  );
};

export default WalletList;