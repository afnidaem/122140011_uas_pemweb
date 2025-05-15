import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'notifications', label: 'Notifications' },
  ];
  
  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold text-secondary-900 mb-6">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <Card>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-700 hover:bg-secondary-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              
              <div className="pt-4 mt-4 border-t border-secondary-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-danger hover:bg-danger hover:bg-opacity-10"
                >
                  Sign out
                </button>
              </div>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <ProfileSettings user={currentUser} />
            )}
            
            {activeTab === 'account' && (
              <AccountSettings />
            )}
            
            {activeTab === 'preferences' && (
              <PreferencesSettings />
            )}
            
            {activeTab === 'notifications' && (
              <NotificationSettings />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    // Mock update - in a real app, this would call an API
    setTimeout(() => {
      setMessage('Profile updated successfully');
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card title="Profile Settings">
      <form onSubmit={handleSubmit}>
        {message && (
          <div className="mb-4 p-3 rounded bg-success bg-opacity-10 text-success text-sm">
            {message}
          </div>
        )}
        
        <div className="flex items-center mb-6">
          <div className="mr-4">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-3xl font-semibold">
              {formData.name?.charAt(0) || 'U'}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">{formData.name}</h3>
            <p className="text-secondary-500">{formData.email}</p>
            
            <button
              type="button"
              className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Change profile picture
            </button>
          </div>
        </div>
        
        <Input
          label="Full Name"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Email Address"
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          helpText="This email will be used for account-related notifications."
        />
        
        <div className="mb-6">
          <label htmlFor="bio" className="block text-sm font-medium text-secondary-700 mb-1">
            Bio (Optional)
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Tell us a little about yourself..."
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Account Settings Component
const AccountSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsSubmitting(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }
    
    // Mock update - in a real app, this would call an API
    setTimeout(() => {
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card title="Account Settings">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-secondary-900 mb-4">Change Password</h2>
        
        <form onSubmit={handleSubmit}>
          {message && (
            <div className="mb-4 p-3 rounded bg-success bg-opacity-10 text-success text-sm">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 rounded bg-danger bg-opacity-10 text-danger text-sm">
              {error}
            </div>
          )}
          
          <Input
            label="Current Password"
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          
          <Input
            label="New Password"
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helpText="Password must be at least 6 characters long"
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="pt-6 mt-6 border-t border-secondary-200">
        <h2 className="text-lg font-medium text-secondary-900 mb-4">Danger Zone</h2>
        
        <div className="bg-danger bg-opacity-5 p-4 rounded-md">
          <h3 className="text-base font-medium text-danger mb-2">Delete Account</h3>
          <p className="text-sm text-secondary-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <Button
            variant="danger"
            size="sm"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Preferences Settings Component
const PreferencesSettings = () => {
  const [currency, setCurrency] = useState('IDR');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    // Mock update - in a real app, this would call an API
    setTimeout(() => {
      setMessage('Preferences updated successfully');
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card title="Preferences">
      <form onSubmit={handleSubmit}>
        {message && (
          <div className="mb-4 p-3 rounded bg-success bg-opacity-10 text-success text-sm">
            {message}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="IDR">Indonesian Rupiah (Rp)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
            <option value="JPY">Japanese Yen (¥)</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="id">Indonesian</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-md border ${
                theme === 'light'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Light</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-md border ${
                theme === 'dark'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span>Dark</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3 rounded-md border ${
                theme === 'system'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>System</span>
              </div>
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    transactions: true,
    security: true,
    promotions: false,
    summary: true,
  });
  const [pushNotifications, setPushNotifications] = useState({
    transactions: true,
    balanceUpdates: true,
    goals: true,
    billReminders: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const toggleEmailNotification = (key) => {
    setEmailNotifications({
      ...emailNotifications,
      [key]: !emailNotifications[key],
    });
  };
  
  const togglePushNotification = (key) => {
    setPushNotifications({
      ...pushNotifications,
      [key]: !pushNotifications[key],
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    // Mock update - in a real app, this would call an API
    setTimeout(() => {
      setMessage('Notification settings updated successfully');
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card title="Notification Settings">
      <form onSubmit={handleSubmit}>
        {message && (
          <div className="mb-4 p-3 rounded bg-success bg-opacity-10 text-success text-sm">
            {message}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">Email Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Transaction Notifications</h3>
                <p className="text-xs text-secondary-500">Receive emails for new transactions in your account</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    emailNotifications.transactions ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => toggleEmailNotification('transactions')}
                >
                  <span className="sr-only">Toggle transactions notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      emailNotifications.transactions ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Security Alerts</h3>
                <p className="text-xs text-secondary-500">Get notified about security events like password changes</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    emailNotifications.security ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => toggleEmailNotification('security')}
                >
                  <span className="sr-only">Toggle security notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      emailNotifications.security ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Promotional Emails</h3>
                <p className="text-xs text-secondary-500">Get updates about new features and special offers</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    emailNotifications.promotions ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => toggleEmailNotification('promotions')}
                >
                  <span className="sr-only">Toggle promotional notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      emailNotifications.promotions ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Weekly Summary</h3>
                <p className="text-xs text-secondary-500">Receive a weekly summary of your financial activity</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    emailNotifications.summary ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => toggleEmailNotification('summary')}
                >
                  <span className="sr-only">Toggle summary notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      emailNotifications.summary ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-6 mt-6 border-t border-secondary-200 mb-6">
          <h2 className="text-lg font-medium text-secondary-900 mb-4">Push Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Transactions</h3>
                <p className="text-xs text-secondary-500">Get notified when new transactions occur</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    pushNotifications.transactions ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => togglePushNotification('transactions')}
                >
                  <span className="sr-only">Toggle transactions push notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      pushNotifications.transactions ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Balance Updates</h3>
                <p className="text-xs text-secondary-500">Get notified about significant changes to your balance</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    pushNotifications.balanceUpdates ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => togglePushNotification('balanceUpdates')}
                >
                  <span className="sr-only">Toggle balance updates push notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      pushNotifications.balanceUpdates ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Goals</h3>
                <p className="text-xs text-secondary-500">Get notified about your financial goals progress</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    pushNotifications.goals ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => togglePushNotification('goals')}
                >
                  <span className="sr-only">Toggle goals push notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      pushNotifications.goals ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-800">Bill Reminders</h3>
                <p className="text-xs text-secondary-500">Get reminded when bills are due</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    pushNotifications.billReminders ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                  onClick={() => togglePushNotification('billReminders')}
                >
                  <span className="sr-only">Toggle bill reminders push notifications</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      pushNotifications.billReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default Settings;