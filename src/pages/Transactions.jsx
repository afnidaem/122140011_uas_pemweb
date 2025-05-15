import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import TransactionList from '../components/transaction/TransactionList';

const Transactions = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Kelola Transaksi
            </h1>
            
            <TransactionList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;