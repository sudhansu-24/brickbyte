"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type User = {
  _id: string;
  name: string;
  email: string;
  walletAddress?: string;
  nonce?: string | number;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; walletAddress?: string }) => Promise<void>;
  logout: () => void;
  walletConnected: boolean;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // Function to check if the backend server is available
  const checkServerAvailability = async () => {
    try {
      const available = await fetch('http://localhost:3001', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      })
      .then(res => res.ok)
      .catch(() => false);
      
      return available;
    } catch (error) {
      console.error('Server availability check failed:', error);
      return false;
    }
  };

  const testBackendConnection = async () => {
    if (!(await checkServerAvailability())) {
      throw new Error('Cannot connect to server. Please try again later.');
    }
  };

  const walletNonce = async (walletAddress: string) => {
    const response = await fetch(`http://localhost:3001/api/auth/nonce/${walletAddress}`);
    if (!response.ok) {
      throw new Error('Failed to fetch nonce');
    }
    const data = await response.json();
    return data.nonce;
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // First check server availability
        const isServerAvailable = await checkServerAvailability();
        if (!isServerAvailable) {
          console.warn('Backend server not available, skipping authentication check');
          setIsLoading(false);
          return;
        }

        // Check if token exists
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch current user
        console.log('Fetching current user...');
        const response = await authService.getCurrentUser();
        console.log('Current user response:', response);
        
        // Process the response
        if (response && response.user) {
          setUser(response.user);
          // If user has a wallet address, mark as connected
          if (response.user.walletAddress) {
            setWalletConnected(true);
          }
        } else {
          console.error('Invalid user data format from API');
          // Clear invalid token
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // Clear invalid token
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.data);
      toast({
        title: "Login successful",
        description: "Welcome back to BrickByte!",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: { name: string; email: string; password: string; walletAddress?: string }) => {
    try {
      setIsLoading(true);

      // Check if the server is available first
      if (!(await checkServerAvailability())) {
        throw new Error('Cannot connect to server. Please try again later.');
      }

      // Log that we're about to register
      console.log('Starting registration process with data:', { 
        ...userData, 
        password: '[REDACTED]' 
      });
      
      // Call the registration service
      const response = await authService.register(userData);
      console.log('Registration successful with response:', response);
      
      // Check if the response has token and user properly
      if (response && response.token) {
        // Create user object from response if not provided directly
        const userObject = response.user || {
          _id: response._id,
          name: response.name || userData.name,
          email: response.email || userData.email,
          walletAddress: response.walletAddress || userData.walletAddress,
        };
        
        setUser(userObject);
        toast({
          title: "Registration successful",
          description: "Welcome to BrickByte!",
          variant: "default",
        });
        
        // Navigate after a brief delay to ensure toast is seen
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
        
        return response;
      } else {
        // If response doesn't have expected structure, throw error
        console.error("Registration response missing expected data:", response);
        throw new Error("Invalid registration response");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || error.response?.data?.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setWalletConnected(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    router.push("/login");
  };

  // Connect wallet function (using MetaMask)
  const connectWallet = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Ethereum provider not found. Please install MetaMask or another wallet.');
      }

      await testBackendConnection();
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const walletAddress = accounts[0];
      console.log('Connected to wallet address:', walletAddress);

      // Get nonce for wallet
      const nonce = await walletNonce(walletAddress);
      console.log('Fetching nonce for wallet:', walletAddress);

      // Sign message with nonce
      const message = `Welcome to BrickByte! Please sign this message to verify your wallet ownership. Nonce: ${nonce}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      // Send signature to backend for verification
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          nonce,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify wallet signature');
      }

      const data = await response.json();
      setUser(data.user);
      setWalletConnected(true);
      
      // Store wallet address in localStorage
      localStorage.setItem('walletAddress', walletAddress);
      
      return walletAddress;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setWalletConnected(false);
      throw new Error('Failed to connect wallet: ' + error.message);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setUser(null);
    setWalletConnected(false);
    localStorage.removeItem('walletAddress');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        walletConnected,
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
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
