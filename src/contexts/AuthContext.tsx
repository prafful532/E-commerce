import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

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
  const { user: supabaseUser, profile, loading, signIn, signUp, signOut, updateProfile: updateSupabaseProfile } = useSupabaseAuth();

  // Transform Supabase user to our User interface
  const user: User | null = supabaseUser && profile ? {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: profile.full_name || 'User',
    role: profile.role,
    avatar: profile.avatar_url || undefined,
    phone: profile.phone || undefined,
    address: profile.address || undefined,
  } : null;

  const login = async (email: string, password: string): Promise<boolean> => {
    return await signIn(email, password);
  };

  const register = async (name: string, email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<boolean> => {
    return await signUp(email, password, name, role);
  };

  const logout = async (): Promise<void> => {
    await signOut();
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    const updates: any = {};
    if (userData.name) updates.full_name = userData.name;
    if (userData.avatar) updates.avatar_url = userData.avatar;
    if (userData.phone) updates.phone = userData.phone;
    if (userData.address) updates.address = userData.address;
    if (userData.role) updates.role = userData.role;

    return await updateSupabaseProfile(updates);
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