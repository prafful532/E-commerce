import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminQuickLogin: React.FC = () => {
  const { login, user } = useAuth();
  const location = useLocation();

  const handleAdminLogin = async () => {
    const success = await login('admin@modernstore.com', 'admin123');
    if (success) {
      toast.success('Logged in as Admin!');
    }
  };

  // Only show on admin page or if user is not logged in and on admin page
  if (user?.role === 'admin' || !location.pathname.includes('/admin')) {
    return null; // Don't show if already admin
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={handleAdminLogin}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
        title="Quick Admin Login"
      >
        <FiUserCheck className="h-5 w-5" />
        <span className="text-sm font-medium">Admin Login</span>
      </button>
    </div>
  );
};

export default AdminQuickLogin;
