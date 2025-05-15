import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import WalletList from '../components/wallet/WalletList';
import { useNavigate } from 'react-router-dom';

const Wallets = () => {
  const navigate = useNavigate();

  const handleWalletSelect = (wallet) => {
    navigate(`/wallets/${wallet.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Kelola Dompet
            </h1>
            
            <WalletList onWalletSelect={handleWalletSelect} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Wallets;