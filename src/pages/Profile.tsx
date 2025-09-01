import React, { useState } from 'react';
import { FiUser, FiMapPin, FiPackage, FiSettings, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [address, setAddress] = useState<any | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/profiles/me');
        const p = data?.data;
        if (p) {
          setProfileData((prev) => ({ ...prev, name: p.full_name || prev.name, email: p.email || prev.email, phone: p.phone || '' }));
          if (p.address) { setAddress(p.address); setAddressForm({ ...addressForm, ...p.address, email: p.email, phone: p.phone || '' }); }
        }
      } catch (_) {}
    };
    const loadOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data?.data || []);
      } catch (_) {
        setOrders([]);
      }
    };
    if (user) { loadProfile(); loadOrders(); }
  }, [user]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'orders', name: 'Orders', icon: FiPackage },
    { id: 'addresses', name: 'Addresses', icon: FiMapPin },
    { id: 'settings', name: 'Settings', icon: FiSettings },
  ];

  const handleSaveProfile = async () => {
    try {
      const ok = await updateProfile({ name: profileData.name, phone: profileData.phone });
      if (ok) { toast.success('Profile updated'); setIsEditing(false); }
    } catch (_) {}
  };

  const saveAddress = async () => {
    const payload = { ...addressForm };
    const ok = await updateProfile({ address: payload, phone: profileData.phone });
    if (ok) { setAddress(payload); setShowAddressForm(false); toast.success('Address saved'); }
  };
  const deleteAddress = async () => {
    const ok = await updateProfile({ address: null });
    if (ok) { setAddress(null); toast.success('Address removed'); }
  };

  const getStatusColor = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'out for delivery':
      case 'shipped':
      case 'in transit':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'processing':
      case 'placed':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-6">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>

              <button
                onClick={logout}
                className="w-full mt-6 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6"
            >
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Profile Information
                    </h2>
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiSave className="mr-2 h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <FiX className="mr-2 h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiEdit2 className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{profileData.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <p className="text-gray-900 dark:text-white">{profileData.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {profileData.phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {profileData.dateOfBirth || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Order History
                  </h2>
                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Order {order.id}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Placed on {order.date}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white">
                            ${order.total}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Saved Addresses
                    </h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Add New Address
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 relative"
                      >
                        {address.isDefault && (
                          <span className="absolute top-3 right-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {address.type}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>{address.name}</p>
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button className="text-blue-600 hover:underline text-sm">
                            Edit
                          </button>
                          <button className="text-red-600 hover:underline text-sm">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Account Settings
                  </h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Notifications
                      </h3>
                      <div className="space-y-4">
                        {[
                          { id: 'email', label: 'Email notifications', checked: true },
                          { id: 'sms', label: 'SMS notifications', checked: false },
                          { id: 'push', label: 'Push notifications', checked: true },
                        ].map((setting) => (
                          <label key={setting.id} className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={setting.checked}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">
                              {setting.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Privacy
                      </h3>
                      <div className="space-y-4">
                        {[
                          { id: 'marketing', label: 'Receive marketing emails', checked: true },
                          { id: 'analytics', label: 'Allow analytics tracking', checked: false },
                        ].map((setting) => (
                          <label key={setting.id} className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={setting.checked}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">
                              {setting.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="border border-red-200 dark:border-red-700 rounded-lg p-6">
                      <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
