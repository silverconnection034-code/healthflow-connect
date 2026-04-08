import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, Hospital, ROLE_PERMISSIONS } from '@/types';

interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
  // For demo navigation — will be replaced by real auth
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);

  const hasPermission = useCallback((module: string) => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role];
    return perms.includes('*') || perms.includes(module);
  }, [user]);

  const login = async (_email: string, _password: string) => {
    // Will be replaced with real Supabase auth
    throw new Error('Not implemented — connect Lovable Cloud');
  };

  const logout = () => {
    setUser(null);
    setHospital(null);
  };

  const setDemoUser = (role: UserRole) => {
    setUser({
      id: 'temp',
      hospital_id: 'temp',
      email: 'user@hospital.co.ke',
      full_name: role === 'super_admin' ? 'Platform Admin' : 'Staff Member',
      role,
      is_active: true,
      created_at: new Date().toISOString(),
    });
    if (role !== 'super_admin') {
      setHospital({
        id: 'temp',
        name: 'Nairobi General Hospital',
        email: 'info@nairobigeneral.co.ke',
        phone: '+254700000000',
        location: 'Nairobi, Kenya',
        subscription_status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, hospital, isAuthenticated: !!user, login, logout, hasPermission, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
