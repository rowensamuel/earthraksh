import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  loginAs: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string) => boolean;
  register: (params: {
    fullName: string;
    email: string;
    mobile: string;
    address: string;
    role: UserRole;
    password?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  refreshProfile: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('earthrakshak_active_user') !== null;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem('earthrakshak_active_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return null as any;
  });

  // Sync active user to local storage for persistence across reloads
  useEffect(() => {
    try {
      if (isAuthenticated && currentUser) {
        localStorage.setItem('earthrakshak_active_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('earthrakshak_active_user');
      }
    } catch (err) {
      console.error('User persistence error:', err);
    }
  }, [currentUser, isAuthenticated]);

  // Initial Supabase Session Check & Auth State Listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            const metadata = session.user.user_metadata || {};
            const role = (profile?.role || metadata.role || 'FARMER') as UserRole;
            const userObj: User = {
              user_id: session.user.id,
              role,
              full_name: profile?.full_name || metadata.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              mobile: profile?.mobile || metadata.mobile || '',
              address: profile?.address || metadata.address || '',
              status: (profile?.status as any) || 'Active',
              created_at: profile?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              designation: profile?.designation || (role === 'ADMIN' ? 'System Administrator' : role === 'BUYER' ? 'Head of Procurement' : 'Principal Cultivator'),
              verified: profile?.verified ?? true,
              avatar_url: profile?.avatar_url
            };
            setCurrentUser(userObj);
            setIsAuthenticated(true);
            localStorage.setItem('earthrakshak_active_user', JSON.stringify(userObj));
          }
        }
      } catch (err) {
        console.warn('Session verification notice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    let subscription: any = null;
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const res = client.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user && isMounted) {
            const { data: profile } = await client
              .from('users')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            const metadata = session.user.user_metadata || {};
            const role = (profile?.role || metadata.role || 'FARMER') as UserRole;
            const userObj: User = {
              user_id: session.user.id,
              role,
              full_name: profile?.full_name || metadata.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              mobile: profile?.mobile || metadata.mobile || '',
              address: profile?.address || metadata.address || '',
              status: (profile?.status as any) || 'Active',
              created_at: profile?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
              designation: profile?.designation || (role === 'ADMIN' ? 'System Administrator' : role === 'BUYER' ? 'Head of Procurement' : 'Principal Cultivator'),
              verified: profile?.verified ?? true,
              avatar_url: profile?.avatar_url
            };
            setCurrentUser(userObj);
            setIsAuthenticated(true);
          } else if (event === 'SIGNED_OUT' && isMounted) {
            setCurrentUser(null as any);
            setIsAuthenticated(false);
            localStorage.removeItem('earthrakshak_active_user');
            localStorage.removeItem('earthrakshak_session');
          }
          if (isMounted) setIsLoading(false);
        }
      );
      subscription = res.data.subscription;
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    const res = await authService.login(email, password);
    setIsLoading(false);
    if (res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem('earthrakshak_active_user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Authentication failed' };
  };

  const loginAs = async (role: UserRole) => {
    let email = 'rajesh.patil@greenvalleyfarm.in';
    if (role === 'ADMIN') email = 'admin.vikram@earthrakshak.org';
    else if (role === 'BUYER') email = 'procurement@agromart.co.in';

    await login(email, 'EarthRakshak2026!');
  };

  const loginWithEmail = (email: string): boolean => {
    login(email, 'EarthRakshak2026!');
    return true;
  };

  const register = async (params: {
    fullName: string;
    email: string;
    mobile: string;
    address: string;
    role: UserRole;
    password?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    const res = await authService.register(params);
    setIsLoading(false);
    if (res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem('earthrakshak_active_user', JSON.stringify(res.user));
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const updateProfile = async (updates: Partial<User>): Promise<User> => {
    if (!currentUser?.user_id) {
      throw new Error('No authenticated user session found.');
    }
    const updated = await userService.updateUserProfile(currentUser.user_id, updates);
    setCurrentUser(updated);
    localStorage.setItem('earthrakshak_active_user', JSON.stringify(updated));
    return updated;
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const fresh = await userService.getUserProfile(session.user.id);
          if (fresh) {
            setCurrentUser(fresh);
            localStorage.setItem('earthrakshak_active_user', JSON.stringify(fresh));
          }
        }
      }
    } catch (err) {
      console.warn('Failed to refresh profile from database:', err);
    }
  };

  const switchRole = (role: UserRole) => {
    loginAs(role);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    sessionStorage.setItem('earthrakshak_logging_out', 'true');
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null as any);
      setIsAuthenticated(false);
      localStorage.removeItem('earthrakshak_active_user');
      localStorage.removeItem('earthrakshak_session');
      setIsLoading(false);
      setTimeout(() => {
        sessionStorage.removeItem('earthrakshak_logging_out');
        setIsLoggingOut(false);
      }, 500);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'FARMER',
        isAuthenticated,
        isLoading,
        isLoggingOut,
        login,
        loginAs,
        loginWithEmail,
        register,
        updateProfile,
        refreshProfile,
        switchRole,
        logout,
        availableUsers: INITIAL_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
