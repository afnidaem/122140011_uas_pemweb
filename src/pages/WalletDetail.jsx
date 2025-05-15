import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useTransaction } from '../context/TransactionContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import WalletForm from '../components/wallet/WalletForm';
import TransactionList from '../components/transaction/TransactionList';
import TransactionForm from '../components/transaction/TransactionForm';
import { formatCurrency } from '../utils/formatCurrency';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi';

const WalletDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    wallets,
    currentWallet,
    loading,
    error,
    setCurrentWallet,
    deleteWallet,
  } = useWallet();
  const { setFilters } = useTransaction();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Find wallet by ID
  useEffect(() => {
    if (wallets.length > 0) {
      const wallet = wallets.find((w) => w.id === id);
      if (wallet) {
        setCurrentWallet(wallet);
      } else {
        navigate('/wallets');
      }
    }
  }, [id, wallets]);

  // Set transaction filter to show only this wallet's transactions
  useEffect(() => {
    if (currentWallet) {
      setFilters({ walletId: currentWallet.id });
    }
  }, [currentWallet]);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleAddTransactionClick = () => {
    setShowAddTransactionModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    const result = await deleteWallet(id);
    setDeleteLoading(false);

    if (result.success) {
      navigate('/wallets');
    }
  };

  const handleWalletFormSuccess = () => {
    setShowEditModal(false);
  };

  const handleTransactionFormSuccess = () => {
    setShowAddTransactionModal(false);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
              <p className="mt-2 text-gray-600">Memuat detail dompet...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 text-red-600 p-4 rounded-md">
                <p>Gagal memuat detail dompet: {error}</p>
                <Button variant="outline" className="mt-2" onClick={() => navigate('/wallets')}>
                  Kembali ke Daftar Dompet
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!currentWallet) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Back button and title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <Link
                  to="/wallets"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2 md:mb-0"
                >
                  <FiArrowLeft className="mr-1" /> Kembali ke Daftar Dompet
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detail Dompet
                </h1>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="flex items-center"
                >
                  <FiEdit2 className="mr-1" /> Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteClick}
                  className="flex items-center"
                >
                  <FiTrash2 className="mr-1" /> Hapus
                </Button>
              </div>
            </div>

            {/* Wallet detail card */}
            <Card className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 md:mb-0 md:mr-6"
                  style={{
                    backgroundColor: currentWallet.color,
                    color: '#ffffff',
                  }}
                >
                  {getWalletIcon(currentWallet.type)}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentWallet.name}
                  </h2>
                  <p className="text-gray-600">
                    {currentWallet.type === 'cash'
                      ? 'Uang Tunai'
                      : currentWallet.type === 'bank'
                      ? 'Rekening Bank'
                      : currentWallet.type === 'e-wallet'
                      ? 'E-Wallet'
                      : currentWallet.type === 'investment'
                      ? 'Investasi'
                      : 'Lainnya'}
                  </p>
                  {currentWallet.description && (
                    <p className="mt-2 text-gray-700">
                      {currentWallet.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-sm text-gray-600">Saldo Saat Ini</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(currentWallet.balance)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Add transaction button */}
            <div className="flex justify-end mb-6">
              <Button
                onClick={handleAddTransactionClick}
                className="flex items-center"
              >
                <FiPlus className="mr-1" /> Tambah Transaksi
              </Button>
            </div>

            {/* Transactions list */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Riwayat Transaksi
              </h2>
              <TransactionList />
            </div>
          </div>
        </main>
      </div>

      {/* Edit wallet modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Dompet"
        showFooter={false}
      >
        <WalletForm
          wallet={currentWallet}
          onSuccess={handleWalletFormSuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete wallet confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Dompet"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        confirmLoading={deleteLoading}
        confirmVariant="danger"
      >
        <p>
          Apakah Anda yakin ingin menghapus dompet "
          <strong>{currentWallet.name}</strong>"?
        </p>
        <p className="mt-2 text-sm text-red-600">
          Semua transaksi yang terkait dengan dompet ini juga akan dihapus.
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>

      {/* Add transaction modal */}
      <Modal
        isOpen={showAddTransactionModal}
        onClose={() => setShowAddTransactionModal(false)}
        title="Tambah Transaksi"
        showFooter={false}
      >
        <TransactionForm
          onSuccess={handleTransactionFormSuccess}
          onCancel={() => setShowAddTransactionModal(false)}
        />
      </Modal>
    </div>
  );
};

export default WalletDetail;