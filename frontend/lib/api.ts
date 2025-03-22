/**
 * API service for BrickByte
 * Handles all communication with the backend
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js'
import { AuthContext } from '@/contexts/AuthContext'
import { useAuth } from '@/contexts/AuthContext'

// Base URL for API requests - ensure it's always set correctly
const API_URL = 'http://localhost:3001'; // Hardcode for development

// Log the API URL being used
console.log('Using API URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('Network Error');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
      throw error;
    }
  }
);

// Function to test if server is reachable
export const testBackendConnection = async () => {
  try {
    const response = await api.get('/', {
      withCredentials: true,
    });
    return response.data.status === 'Server is running!';
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

// Get wallet nonce
export const walletNonce = async (walletAddress: string) => {
  try {
    const response = await api.get(`/auth/nonce/${walletAddress}`, {
      withCredentials: true,
    });
    return response.data.nonce;
  } catch (error) {
    console.error('Failed to fetch nonce:', error);
    throw error;
  }
};

// Verify wallet signature
export const verifyWalletSignature = async (walletAddress: string, signature: string, nonce: string) => {
  try {
    const response = await api.post('/auth/login', {
      walletAddress,
      signature,
      nonce,
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to verify wallet signature:', error);
    throw error;
  }
};

// Authentication services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  },
  
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    walletAddress?: string;
  }) => {
    // First check if backend is available
    const isBackendAvailable = await testBackendConnection();
    if (!isBackendAvailable) {
      throw new Error('Backend server is not available. Please check if the server is running.');
    }
    
    try {
      console.log('Sending registration request to:', `${API_URL}/auth/register`);
      const response = await api.post('/auth/register', userData, {
        // Make sure we get a proper response or error
        validateStatus: status => true
      });
      
      // Log the raw response for debugging
      console.log('Raw registration response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      // Handle different status codes explicitly
      if (response.status >= 400) {
        throw new Error(response.data?.message || `Server error: ${response.status} ${response.statusText}`);
      }
      
      // Check if response has the expected structure
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      // Store token if available
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      } else {
        console.warn('No token in registration response');
      }

      // Log the response for debugging
      console.log('Registration response data:', response.data);
      
      // If no user in response, try to construct one from the data
      if (!response.data.user && response.data._id) {
        return {
          token: response.data.token,
          user: {
            _id: response.data._id,
            name: response.data.name || userData.name,
            email: response.data.email || userData.email,
            walletAddress: response.data.walletAddress || userData.walletAddress,
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error);
      
      // Check for network errors
      if (axios.isAxiosError(error) && !error.response) {
        console.error('Network error details:', error.message, error.code, error.cause);
        throw new Error(`Network error: Backend server is not responding. Please verify the server is running.`);
      }
      
      // Handle different status codes
      if (error.response?.status === 409) {
        throw new Error('User already exists with this email or wallet address');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid registration data');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error: The backend encountered an issue. Please try again later.');
      }
      
      // Default error message
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  walletLogin: async (address: string, signature: string, nonce: string) => {
    // First check if backend is available
    const isBackendAvailable = await testBackendConnection();
    if (!isBackendAvailable) {
      throw new Error('Backend server is not available. Please check if the server is running.');
    }
    
    try {
      console.log('Sending wallet verification request:', { address, signature, nonce });
      const response = await api.post('/wallet/verify', { address, signature, nonce });
      console.log('Wallet verification response:', response.data);
      
      // Make sure we have a token in the response
      if (response.data && response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        
        // Return a consistent format regardless of what the server returns
        if (response.data.user) {
          return {
            token: response.data.token,
            user: response.data.user
          };
        } else {
          // If the user object isn't directly provided but we have user info
          return {
            token: response.data.token,
            user: {
              _id: response.data._id || 'unknown',
              name: response.data.name || `Wallet User ${address.substring(0, 6)}`,
              email: response.data.email || `${address.toLowerCase()}@wallet.user`,
              walletAddress: address
            }
          };
        }
      } else {
        console.error('Invalid response from wallet verification:', response.data);
        throw new Error('Invalid response from server - no token received');
      }
    } catch (error: any) {
      console.error('Wallet login error:', error);
      
      if (axios.isAxiosError(error) && !error.response) {
        throw new Error('Network error: Backend server is not responding.');
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Wallet login failed';
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      // Log the actual response format for debugging
      console.log('Current user response:', response);
      
      // Handle different response formats
      if (response.data && response.data.user) {
        return {
          user: response.data.user
        };
      } else if (response.data) {
        // If the API returns the user object directly
        return {
          user: response.data
        };
      } else {
        throw new Error('Invalid user data format from API');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get user data';
      throw new Error(errorMessage);
    }
  },
};

// Property services
export const propertyService = {
  getProperties: async () => {
    const response = await api.get('/properties');
    return response.data;
  },
  
  getProperty: async (id: string) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
  
  buyTokens: async (propertyId: string, amount: number) => {
    const response = await api.post('/properties/buy', { propertyId, amount });
    return response.data;
  },
  
  getPropertyContract: async (id: string) => {
    const response = await api.get(`/properties/${id}/contract`);
    return response.data;
  },
};

// Market services
export const marketService = {
  getMarketInsights: async (propertyId?: string) => {
    const url = propertyId ? `/market/insights/${propertyId}` : '/market/insights';
    const response = await api.get(url);
    return response.data;
  },
};

// Portfolio services
export const portfolioService = {
  getPortfolio: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },
  
  getHistoricalPerformance: async () => {
    const response = await api.get('/portfolio/history');
    return response.data;
  },
  
  rebalancePortfolio: async () => {
    const response = await api.post('/portfolio/rebalance');
    return response.data;
  },
};

// Trading services
export const tradingService = {
  executeSale: async (propertyId: string, amount: number) => {
    const response = await api.post('/trade/sell', { propertyId, amount });
    return response.data;
  },
};

// Staking services
export const stakingService = {
  getStakingOptions: async () => {
    const response = await api.get('/staking/options');
    return response.data;
  },
  
  stakeTokens: async (propertyId: string, amount: number, duration: number) => {
    const response = await api.post('/staking/stake', {
      propertyId, amount, duration
    });
    return response.data;
  },
  
  unstakeTokens: async (stakeId: string) => {
    const response = await api.post(`/staking/unstake/${stakeId}`);
    return response.data;
  },
  
  getStakedTokens: async () => {
    const response = await api.get('/staking/my-stakes');
    return response.data;
  },
};

// Governance services
export const governanceService = {
  getProposals: async () => {
    const response = await api.get('/governance/proposals');
    return response.data;
  },
  
  getProposalById: async (id: string) => {
    const response = await api.get(`/governance/proposals/${id}`);
    return response.data;
  },
  
  createProposal: async (proposal: {
    title: string;
    description: string;
    propertyId?: string;
    options: string[];
    startDate: string;
    endDate: string;
  }) => {
    const response = await api.post('/governance/proposals', proposal);
    return response.data;
  },
  
  voteOnProposal: async (proposalId: string, option: string) => {
    const response = await api.post(`/governance/proposals/${proposalId}/vote`, { option });
    return response.data;
  },
};

// AI services
export const aiService = {
  getPropertyPrediction: async (propertyData: any) => {
    const response = await api.post('/ai/predict', propertyData);
    return response.data;
  },
};

export default api;
