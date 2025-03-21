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
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [serverAvailable, setServerAvailable] = useState<boolean>(true);
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
      
      setServerAvailable(available);
      return available;
    } catch (error) {
      console.error('Server availability check failed:', error);
      setServerAvailable(false);
      return false;
    }
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
      if (!serverAvailable) {
        const isNowAvailable = await checkServerAvailability();
        if (!isNowAvailable) {
          throw new Error('Cannot connect to server. Please try again later.');
        }
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
  const connectWallet = async (): Promise<void> => {
    try {
      // Check server availability first
      if (!serverAvailable) {
        const isNowAvailable = await checkServerAvailability();
        if (!isNowAvailable) {
          throw new Error('Cannot connect to server. Please try again later.');
        }
      }

      // Check if MetaMask is installed
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask browser extension",
          variant: "destructive",
        });
        return;
      }

      // Request accounts
      console.log('Requesting Ethereum accounts...');
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      console.log('Connected to wallet address:', walletAddress);

      // Get nonce from backend
      console.log('Fetching nonce for wallet:', walletAddress);
      
      // Step 1: Get nonce from server
      const nonceResponse = await authService.walletNonce(walletAddress);
      const nonce = nonceResponse.nonce;
      console.log('Received nonce:', nonce);
      
      // Step 2: Request signature from wallet
      console.log('Requesting signature with nonce:', nonce);
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });
      console.log('Signature obtained successfully');

      // Step 3: Verify signature with backend
      console.log('Verifying signature with backend...');
      const response = await authService.walletLogin(walletAddress, signature, nonce);
      console.log('Wallet verification successful:', response);
      
      // Step 4: Set user state and redirect
      if (response && response.user) {
        setUser(response.user);
        setWalletConnected(true);
        
        toast({
          title: "Wallet connected",
          description: `Connected to wallet ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
        });

        // Redirect to dashboard or home 
        // Return void here to ensure Promise<void> return type
        router.push("/dashboard");
        return;
      } else {
        console.error('Invalid response format from wallet login:', response);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Wallet connection failed",
        description: error.message || "Could not connect to wallet",
        variant: "destructive",
      });
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setWalletConnected(false);
    // If user was authenticated only via wallet, log them out completely
    if (user?.walletAddress && !user.email) {
      logout();
    } else if (user?.walletAddress) {
      // If user has both wallet and email, just remove wallet
      setUser({ ...user, walletAddress: undefined });
    }
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
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
