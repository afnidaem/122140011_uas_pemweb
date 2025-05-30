const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} MoneyMate. All rights reserved.
            </div>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-900">
              Tentang Kami
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              Bantuan
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-900">
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;