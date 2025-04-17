'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  walletAddress: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, walletAddress: string) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await api.get('/api/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      Cookies.remove('token');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      Cookies.set('token', token, { expires: 1 }); // Expires in 1 day
      setUser(user);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Login failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, walletAddress: string) => {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        walletAddress,
      });
      const { token, user } = response.data;
      Cookies.set('token', token, { expires: 1 }); // Expires in 1 day
      setUser(user);
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Registration failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    });
    router.push('/login');
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const walletAddress = accounts[0];
      
      // Update user's wallet address in backend
      if (user) {
        await api.put(`/api/profiles/${user.id}`, {
          wallet_address: walletAddress,
        });
        setUser({ ...user, walletAddress });
      }

      toast({
        title: 'Success',
        description: 'Wallet connected successfully',
      });

      return walletAddress;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      if (user) {
        await api.put(`/api/profiles/${user.id}`, {
          wallet_address: null,
        });
        setUser({ ...user, walletAddress: null });
      }
      toast({
        title: 'Success',
        description: 'Wallet disconnected successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        connectWallet,
        disconnectWallet,
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