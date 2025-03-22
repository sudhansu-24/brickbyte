import { ethers } from 'ethers';
import PropertyTokenABI from '@/lib/PropertyTokenABI';

// Ethereum network configuration
const NETWORK_CONFIG = {
  chainId: '0x1', // Mainnet
  chainName: 'Ethereum Mainnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'], // Replace with your Infura key in production
  blockExplorerUrls: ['https://etherscan.io'],
};

// Get Ethereum provider
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to a public RPC provider
  return new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrls[0]);
};

// Get signer for transactions
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// Connect to PropertyToken contract
export const getPropertyTokenContract = (contractAddress: string) => {
  const provider = getProvider();
  return new ethers.Contract(contractAddress, PropertyTokenABI, provider);
};

// Get connected contract with signer for write operations
export const getSignedPropertyTokenContract = async (contractAddress: string) => {
  const signer = await getSigner();
  return new ethers.Contract(contractAddress, PropertyTokenABI, signer);
};

// Request account access from user's wallet
export const connectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or another wallet.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error('User denied account access', error);
    throw error;
  }
};

// Buy property tokens
export const buyPropertyTokens = async (contractAddress: string, amount: number, tokenPrice: number) => {
  try {
    // Check if we're in development mode with a mock contract
    if (contractAddress === '0x5FbDB2315678afecb367f032d93F642f64180aa3' || contractAddress === '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') {
      console.log('Using mock contract in development mode');
      // Simulate a successful transaction
      return {
        hash: '0x' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
        wait: async () => ({ status: 1 })
      };
    }

    const contract = await getSignedPropertyTokenContract(contractAddress);
    const value = ethers.parseEther((amount * tokenPrice).toString());
    
    const tx = await contract.buyTokens(amount, { value });
    return await tx.wait();
  } catch (error) {
    console.error('Error buying tokens:', error);
    throw error;
  }
};

// Get token price
export const getTokenPrice = async (contractAddress: string) => {
  try {
    // Check if we're in development mode with a mock contract
    if (contractAddress === '0x5FbDB2315678afecb367f032d93F642f64180aa3' || contractAddress === '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') {
      console.log('Using mock contract in development mode for token price');
      return '0.1'; // Return mock price of 0.1 ETH
    }

    const contract = getPropertyTokenContract(contractAddress);
    const price = await contract.getTokenPrice();
    return ethers.formatEther(price);
  } catch (error) {
    console.error('Error getting token price:', error);
    throw error;
  }
};

// Get available tokens
export const getAvailableTokens = async (contractAddress: string) => {
  try {
    // Check if we're in development mode with a mock contract
    if (contractAddress === '0x5FbDB2315678afecb367f032d93F642f64180aa3' || contractAddress === '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') {
      console.log('Using mock contract in development mode for available tokens');
      return '1000'; // Return mock available tokens
    }

    const contract = getPropertyTokenContract(contractAddress);
    const available = await contract.getAvailableTokens();
    return available.toString();
  } catch (error) {
    console.error('Error getting available tokens:', error);
    throw error;
  }
};

// Get token balance for an address
export const getTokenBalance = async (contractAddress: string, address: string) => {
  try {
    // Check if we're in development mode with a mock contract
    if (contractAddress === '0x5FbDB2315678afecb367f032d93F642f64180aa3' || contractAddress === '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512') {
      console.log('Using mock contract in development mode for token balance');
      // Return a mock balance based on the address to simulate different users having different balances
      const mockBalance = parseInt(address.slice(-4), 16) % 100; // Use last 4 chars of address to generate a number 0-99
      return mockBalance.toString();
    }

    const contract = getPropertyTokenContract(contractAddress);
    const balance = await contract.balanceOf(address);
    return balance.toString();
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};
