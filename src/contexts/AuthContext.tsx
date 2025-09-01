import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  address?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: 'user' | 'admin') => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: authUser, loading, signIn, signUp, signOut, updateProfile: updateApiProfile } = useAuthHook();

  const user: User | null = authUser ? {
    id: authUser.id,
    email: authUser.email,
    name: authUser.full_name || 'User',
    role: authUser.role,
  } : null;

  const login = async (email: string, password: string): Promise<boolean> => signIn(email, password);

  const register = async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<boolean> => signUp(email, password, name, role);

  const logout = async (): Promise<void> => { await signOut(); };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    const updates: any = {};
    if (userData.name !== undefined) updates.full_name = userData.name;
    if (userData.role !== undefined) updates.role = userData.role;
    if (userData.phone !== undefined) updates.phone = userData.phone;
    if (userData.address !== undefined) updates.address = userData.address;
    return await updateApiProfile(updates);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
