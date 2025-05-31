import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useTransaction } from '../context/TransactionContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/dateFormatter';
import { FiPlus, FiArrowDown, FiArrowUp, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import TransactionPDFExporter from '../components/transaction/TransactionPDFExporter';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { wallets, loading: walletsLoading } = useWallet();
  const {
    transactions,
    filters,
    loading: transactionsLoading,
    fetchTransactions,
    setFilters,
  } = useTransaction();

  // Summary data
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    netFlow: 0,
  });

  // Period filter for transactions
  const [period, setPeriod] = useState('this-month');

  // Load transactions for the current period when component mounts
  useEffect(() => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'this-week':
        // Start of week (Sunday)
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        // End of week (Saturday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this-month':
      default:
        // Start of month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // End of month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'last-month':
        // Start of last month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        // End of last month
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'this-year':
        // Start of year
        startDate = new Date(now.getFullYear(), 0, 1);
        // End of year
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case 'all-time':
        startDate = null;
        endDate = null;
        break;
    }

    setFilters({
      startDate,
      endDate,
    });
  }, [period]);

  // Update summary data when transactions or wallets change
  useEffect(() => {
    // Calculate total balance from all wallets
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

    // Calculate income, expense, and net flow for the current period
    const filteredTransactions = transactions;
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalIncome - totalExpense;

    setSummary({
      totalBalance,
      totalIncome,
      totalExpense,
      netFlow,
    });
  }, [wallets, transactions]);

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Get top wallets (by balance)
  const topWallets = [...wallets]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header with greeting */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Halo, {currentUser?.name || 'Pengguna'}!
              </h1>
              <p className="text-gray-600">
                Selamat datang di dashboard MoneyMate
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                    <FiCreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Aset</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(summary.totalBalance)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <FiArrowUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Pemasukan</p>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(summary.totalIncome)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                    <FiArrowDown className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Pengeluaran</p>
                    <p className="text-xl font-semibold text-red-600">
                      {formatCurrency(summary.totalExpense)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white">
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-full ${
                      summary.netFlow >= 0
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-orange-100 text-orange-600'
                    } mr-4`}
                  >
                    <FiDollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Arus Kas</p>
                    <p
                      className={`text-xl font-semibold ${
                        summary.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`}
                    >
                      {formatCurrency(summary.netFlow)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Period selector */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Ringkasan Keuangan
              </h2>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="form-input pr-10 py-2"
                >
                  <option value="today">Hari Ini</option>
                  <option value="this-week">Minggu Ini</option>
                  <option value="this-month">Bulan Ini</option>
                  <option value="last-month">Bulan Lalu</option>
                  <option value="this-year">Tahun Ini</option>
                  <option value="all-time">Sepanjang Waktu</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Transactions */}
              <div className="lg:col-span-2">
                <Card
                  title="Transaksi Terbaru"
                  footer={
                    <div className="text-center">
                      <Link to="/transactions">
                        <Button variant="link">Lihat Semua Transaksi</Button>
                      </Link>
                    </div>
                  }
                >
                  {transactionsLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary-600"></div>
                      <p className="mt-2 text-sm text-gray-600">Memuat transaksi...</p>
                    </div>
                  ) : recentTransactions.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Belum ada transaksi</p>
                      <Link to="/transactions" className="mt-2 inline-block">
                        <Button>
                          <FiPlus className="mr-1" /> Tambah Transaksi
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {recentTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="py-3 flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3 ${
                                transaction.type === 'expense'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-green-100 text-green-600'
                              }`}
                            >
                              {transaction.type === 'expense' ? '📉' : '📈'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(transaction.date)}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`font-semibold ${
                              transaction.type === 'expense'
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {transaction.type === 'expense' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Wallets */}
              <div>
                <Card
                  title="Dompet Saya"
                  footer={
                    <div className="text-center">
                      <Link to="/wallets">
                        <Button variant="link">Kelola Dompet</Button>
                      </Link>
                    </div>
                  }
                >
                  {walletsLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary-600"></div>
                      <p className="mt-2 text-sm text-gray-600">Memuat dompet...</p>
                    </div>
                  ) : topWallets.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">Belum ada dompet</p>
                      <Link to="/wallets" className="mt-2 inline-block">
                        <Button>
                          <FiPlus className="mr-1" /> Tambah Dompet
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {topWallets.map((wallet) => (
                        <div
                          key={wallet.id}
                          className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg mr-3"
                              style={{
                                backgroundColor: wallet.color,
                                color: '#ffffff',
                              }}
                            >
                              {wallet.type === 'cash' ? '💵' : wallet.type === 'bank' ? '🏦' : '💳'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {wallet.name}
                              </p>
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
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(wallet.balance)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;