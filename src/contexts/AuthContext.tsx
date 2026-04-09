import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupaUser, Session } from '@supabase/supabase-js';

export type UserRole =
  | 'super_admin' | 'hospital_admin' | 'receptionist' | 'doctor'
  | 'nurse' | 'pharmacist' | 'lab_technician' | 'accountant' | 'driver';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  hospital_id: string | null;
  role: UserRole;
  is_active: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  logo_url?: string;
  subscription_status: string;
  subscription_start?: string;
  subscription_end?: string;
  is_active: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  hospital_admin: [
    'dashboard', 'reception', 'doctor', 'nurse', 'pharmacy', 'lab',
    'ambulance', 'billing', 'staff', 'settings', 'reports', 'insurance',
    'notifications', 'audit_logs',
  ],
  receptionist: ['dashboard', 'reception', 'billing'],
  doctor: ['dashboard', 'doctor', 'lab'],
  nurse: ['dashboard', 'nurse', 'doctor'],
  pharmacist: ['dashboard', 'pharmacy'],
  lab_technician: ['dashboard', 'lab'],
  accountant: ['dashboard', 'billing', 'reports', 'insurance'],
  driver: ['dashboard', 'ambulance'],
};

interface AuthContextType {
  user: AppUser | null;
  hospital: Hospital | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    hospital_name: string; email: string; phone: string; location: string;
    admin_name: string; admin_email: string; admin_password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async (supaUser: SupaUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supaUser.id)
        .maybeSingle();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supaUser.id)
        .maybeSingle();

      const role = (roleData?.role as UserRole) || 'receptionist';

      const appUser: AppUser = {
        id: supaUser.id,
        email: supaUser.email || '',
        full_name: profile?.full_name || '',
        hospital_id: profile?.hospital_id || null,
        role,
        is_active: profile?.is_active ?? true,
      };

      setUser(appUser);

      if (profile?.hospital_id) {
        const { data: hosp } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', profile.hospital_id)
          .maybeSingle();

        if (hosp) {
          setHospital(hosp as Hospital);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setTimeout(() => fetchUserData(newSession.user), 0);
        } else {
          setUser(null);
          setHospital(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserData(existingSession.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const hasPermission = useCallback((module: string) => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role];
    return perms.includes('*') || perms.includes(module);
  }, [user]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (data: {
    hospital_name: string; email: string; phone: string; location: string;
    admin_name: string; admin_email: string; admin_password: string;
  }) => {
    // 1. Sign up the admin user (auto-confirm is enabled)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.admin_email,
      password: data.admin_password,
      options: {
        data: { full_name: data.admin_name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed');

    // Wait a moment for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Create the hospital
    const { data: hosp, error: hospError } = await supabase
      .from('hospitals')
      .insert({
        name: data.hospital_name,
        email: data.email,
        phone: data.phone,
        location: data.location,
      })
      .select()
      .single();
    if (hospError) throw hospError;

    // 3. Update profile with hospital_id
    await supabase
      .from('profiles')
      .update({ hospital_id: hosp.id, full_name: data.admin_name, phone: data.phone })
      .eq('user_id', authData.user.id);

    // 4. Assign hospital_admin role
    await supabase
      .from('user_roles')
      .insert({ user_id: authData.user.id, hospital_id: hosp.id, role: 'hospital_admin' });

    // Refresh user data
    await fetchUserData(authData.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHospital(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      user, hospital, session, isAuthenticated: !!user, isLoading,
      login, register, logout, hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
