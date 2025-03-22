import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'react-toastify';

interface AuthContextType {
  walletAddress: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0].toLowerCase();
        setWalletAddress(account);
        setIsConnected(true);

        // Get nonce
        const nonceResponse = await api.get(`/auth/nonce/${account}`);
        const nonce = nonceResponse.data.nonce;

        // Sign message
        const message = `Welcome to BrickByte! Please sign this message to verify your wallet ownership. Nonce: ${nonce}`;
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, account],
        });

        // Verify signature
        const loginResponse = await api.post('/auth/login', {
          walletAddress: account,
          signature,
          nonce,
        });

        // Store token
        if (loginResponse.data.token) {
          localStorage.setItem('auth_token', loginResponse.data.token);
        }

        // Show success notification
        toast.success(`Connected to wallet: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    localStorage.removeItem('auth_token');
    toast.info('Disconnected from wallet');
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const walletAddress = localStorage.getItem('walletAddress');
        if (walletAddress) {
          setWalletAddress(walletAddress);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking user login:', error);
      }
    };

    checkUserLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{
      walletAddress,
      isConnected,
      connectWallet,
      disconnectWallet,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
