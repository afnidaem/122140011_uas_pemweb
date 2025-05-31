import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCreditCard, FiDollarSign, FiUser, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      name: 'Dompet',
      icon: <FiCreditCard className="w-5 h-5" />,
      path: '/wallets',
    },
    {
      name: 'Transaksi',
      icon: <FiDollarSign className="w-5 h-5" />,
      path: '/transactions',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="px-4 space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} FinansialApp
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;