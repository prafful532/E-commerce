import React, { createContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface Notification {
  _id: string;
  type: 'order' | 'payment' | 'promotion' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  notifications: Notification[];
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => void;
  register: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  sendPhoneVerification: (phone: string) => Promise<boolean>;
  verifyPhone: (code: string) => Promise<boolean>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      // Check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const oauthToken = urlParams.get('token');
      const oauthUser = urlParams.get('user');
      
      if (oauthToken && oauthUser) {
        try {
          const userData = JSON.parse(decodeURIComponent(oauthUser));
          setUser(userData);
          setToken(oauthToken);
          localStorage.setItem('token', oauthToken);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          setLoading(false);
          return;
        } catch (error) {
          console.error('OAuth callback error:', error);
        }
      }
      
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUser(data.user);
              await fetchNotifications();
            } else {
              console.warn('Invalid user data received:', data);
              localStorage.removeItem('token');
              setToken(null);
            }
          } else {
            console.warn('Auth verification failed with status:', response.status);
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/auth/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        await fetchNotifications();
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error during login');
      return false;
    }
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: string = 'user'
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        await fetchNotifications();
        toast.success('Registration successful!');
        return true;
      } else {
        toast.error(data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error during registration');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setNotifications([]);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!token) {
      toast.error('Not authenticated');
      return false;
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(data.message || 'Profile update failed');
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Network error during profile update');
      return false;
    }
  };

  const changePassword = async (
    currentPassword: string, 
    newPassword: string
  ): Promise<boolean> => {
    if (!token) {
      toast.error('Not authenticated');
      return false;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully');
        return true;
      } else {
        toast.error(data.message || 'Password change failed');
        return false;
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error during password change');
      return false;
    }
  };

  const verifyEmail = async (verificationToken: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Email verified successfully');
        // Refresh user data
        if (token) {
          const userResponse = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userData = await userResponse.json();
          if (userData.success) {
            setUser(userData.user);
          }
        }
        return true;
      } else {
        toast.error(data.message || 'Email verification failed');
        return false;
      }
    } catch (error) {
      console.error('Email verification error:', error);
      toast.error('Network error during email verification');
      return false;
    }
  };

  const sendPhoneVerification = async (phone: string): Promise<boolean> => {
    if (!token) {
      toast.error('Not authenticated');
      return false;
    }

    try {
      const response = await fetch('/api/auth/send-phone-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Verification code sent to your phone');
        return true;
      } else {
        toast.error(data.message || 'Failed to send verification code');
        return false;
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error('Network error during phone verification');
      return false;
    }
  };

  const verifyPhone = async (code: string): Promise<boolean> => {
    if (!token) {
      toast.error('Not authenticated');
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Phone number verified successfully');
        // Refresh user data
        const userResponse = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userResponse.json();
        if (userData.success) {
          setUser(userData.user);
        }
        return true;
      } else {
        toast.error(data.message || 'Phone verification failed');
        return false;
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error('Network error during phone verification');
      return false;
    }
  };

  const markNotificationRead = async (id: string): Promise<void> => {
    if (!token) return;

    try {
      const response = await fetch(`/api/auth/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  const value: AuthContextType = {
    user,
    token,
    loading,
    notifications,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    changePassword,
    verifyEmail,
    sendPhoneVerification,
    verifyPhone,
    fetchNotifications,
    markNotificationRead
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
