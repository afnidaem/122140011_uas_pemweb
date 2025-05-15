import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { FiUser, FiMail, FiLock, FiCamera, FiAlertCircle } from 'react-icons/fi';

const Profile = () => {
  const { currentUser, loading, error } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(null);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors on change
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors on change
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.name.trim()) {
      errors.name = 'Nama harus diisi';
    }
    
    if (!profileForm.email.trim()) {
      errors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Password saat ini harus diisi';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Password baru harus diisi';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    // Simulate API call for profile update
    setTimeout(() => {
      setUpdateSuccess('Profil berhasil diperbarui');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    }, 1000);
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    // Simulate API call for password update
    setTimeout(() => {
      setUpdateSuccess('Password berhasil diperbarui');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 3000);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Profil Saya
            </h1>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'profile'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Informasi Profil
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'security'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('security')}
              >
                Keamanan
              </button>
            </div>
            
            {/* Success message */}
            {updateSuccess && (
              <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md">
                {updateSuccess}
              </div>
            )}
            
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <Card>
                <div className="flex flex-col md:flex-row">
                  {/* Avatar section */}
                  <div className="w-full md:w-1/3 flex flex-col items-center p-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden">
                        {currentUser?.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-16 h-16" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700">
                        <FiCamera className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="mt-4 text-gray-600 text-sm text-center">
                      Unggah gambar (Maksimal 1MB)
                      <br />
                      Format: JPG, PNG
                    </p>
                  </div>
                  
                  {/* Profile form */}
                  <div className="w-full md:w-2/3 p-4">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="mb-4">
                        <label htmlFor="name" className="form-label">
                          Nama
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            className={`form-input pl-10 ${
                              profileErrors.name ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        {profileErrors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            className={`form-input pl-10 ${
                              profileErrors.email ? 'border-red-500' : ''
                            }`}
                          />
                        </div>
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.email}
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <Button type="submit">Simpan Perubahan</Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="form-label">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`form-input pl-10 ${
                          passwordErrors.currentPassword ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.currentPassword}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="form-label">
                      Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`form-input pl-10 ${
                          passwordErrors.newPassword ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`form-input pl-10 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <Button type="submit">Perbarui Password</Button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;