"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface UseWalletReturn {
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  walletAddress: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  chainId: string | null;
  switchNetwork: (chainId: string) => Promise<boolean>;
}

export function useWallet(): UseWalletReturn {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Get connected accounts
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            
            // Get current chain ID
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(chainId);

            // Verify if the wallet is on the correct network
            await verifyNetwork(chainId);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          toast({
            title: 'Wallet Error',
            description: 'Error checking wallet connection',
            variant: 'destructive',
          });
        }
      }
    };


    checkConnection();
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setWalletAddress(null);
        } else {
          setWalletAddress(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(chainId);
        window.location.reload();
      };

      if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const verifyNetwork = useCallback(async (currentChainId: string) => {
    const requiredChainId = process.env.NEXT_PUBLIC_REQUIRED_CHAIN_ID || '0xaa36a7'; // Default to Sepolia testnet
    
    if (currentChainId !== requiredChainId) {
      try {
        await window.ethereum!.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: requiredChainId }],
        });
        return true;
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added, add it
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: requiredChainId,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [
                  `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
                  'https://rpc.sepolia.org',
                ],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return true;
        }
        throw error;
      }
    }
    return true;
  }, []);

  // Helper function to check if the network is Sepolia
  const isSepoliaNetwork = useCallback((chainId: string | null): boolean => {
    return chainId === '0xaa36a7';
  }, []);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast({
        title: 'Wallet Connection Failed',
        description: 'Please install MetaMask or another Ethereum wallet extension.',
        variant: 'destructive',
      });
      return null;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Verify network and switch if needed
      await verifyNetwork(chainId);
      
      const address = accounts[0];
      setWalletAddress(address);
      setChainId(chainId);

      // Get nonce from backend
      const nonceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/nonce/${address}`);
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce from server');
      }
      const { nonce } = await nonceResponse.json();

      // Request signature
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Verify signature with backend
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, nonce }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify wallet signature');
      }

      const { token } = await verifyResponse.json();
      localStorage.setItem('auth_token', token);
      
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
      
      return address;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [toast, verifyNetwork]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setChainId(null);
    localStorage.removeItem('auth_token');
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  }, [toast]);

  const switchNetwork = useCallback(async (targetChainId: string): Promise<boolean> => {
    if (!window.ethereum) return false;
    
    try {
      const success = await verifyNetwork(targetChainId);
      return success;
    } catch (error: any) {
      toast({
        title: 'Network Switch Failed',
        description: error.message || 'Failed to switch network',
        variant: 'destructive',
      });
      return false;
    }
  }, [verifyNetwork, toast]);

  return {
    connectWallet,
    disconnectWallet,
    walletAddress,
    isConnecting,
    isConnected: !!walletAddress,
    chainId,
    switchNetwork,
  };
}

// Types for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
