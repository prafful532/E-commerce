import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiInfo } from 'react-icons/fi';

const DemoModeIndicator: React.FC = () => {
  const { token } = useAuth();

  if (token !== 'demo-admin-token') {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-30 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-center py-2 text-sm">
      <div className="flex items-center justify-center space-x-2">
        <FiInfo className="h-4 w-4" />
        <span>
          <strong>Demo Mode:</strong> Using sample data - database not connected
        </span>
      </div>
    </div>
  );
};

export default DemoModeIndicator;
