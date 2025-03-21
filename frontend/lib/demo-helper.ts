/**
 * Demo Helper Functions
 * 
 * These functions help demonstrate the functionality of the BrickByte platform
 * without requiring actual blockchain interactions.
 */

import { toast } from '@/hooks/use-toast';

// Demo wallet addresses for quick connection
const demoWallets = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    name: 'Demo Wallet 1',
    balance: '5.0 ETH'
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Demo Wallet 2',
    balance: '10.0 ETH'
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    name: 'Demo Wallet 3',
    balance: '2.5 ETH'
  }
];

// Function to simulate wallet connection
export const connectDemoWallet = (walletIndex = 0) => {
  return new Promise<string>((resolve) => {
    // Simulate connection delay
    setTimeout(() => {
      const wallet = demoWallets[walletIndex % demoWallets.length];
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${wallet.name} with balance ${wallet.balance}`,
      });
      resolve(wallet.address);
    }, 1000);
  });
};

// Function to simulate token purchase
export const purchaseDemoTokens = (propertyName: string, tokenAmount: number, tokenPrice: number) => {
  return new Promise<void>((resolve, reject) => {
    // Simulate transaction delay
    setTimeout(() => {
      const totalCost = tokenAmount * tokenPrice;
      
      // 90% chance of success
      if (Math.random() < 0.9) {
        toast({
          title: 'Purchase Successful',
          description: `You have successfully purchased ${tokenAmount} tokens of ${propertyName} for $${totalCost.toFixed(2)}`,
        });
        resolve();
      } else {
        toast({
          title: 'Purchase Failed',
          description: 'Transaction failed. Please try again.',
          variant: 'destructive',
        });
        reject(new Error('Transaction failed'));
      }
    }, 2000);
  });
};

// Function to simulate getting token balance
export const getDemoTokenBalance = (propertyName: string, walletAddress: string) => {
  // Generate a deterministic but seemingly random balance based on the wallet address and property name
  const hash = walletAddress.slice(-4) + propertyName.length;
  const balance = parseInt(hash, 16) % 50; // 0-49 tokens
  
  return Promise.resolve(balance);
};

// Function to simulate getting property portfolio
export const getDemoPortfolio = (walletAddress: string) => {
  // Generate a portfolio based on the wallet address
  const hash = parseInt(walletAddress.slice(-4), 16);
  
  // Create 1-3 portfolio items
  const numItems = (hash % 3) + 1;
  const portfolio = [];
  
  for (let i = 0; i < numItems; i++) {
    const propertyId = ((hash + i) % 3) + 1; // Property IDs 1-3
    const tokenAmount = ((hash + i * 7) % 30) + 5; // 5-34 tokens
    
    portfolio.push({
      propertyId: propertyId.toString(),
      tokenAmount,
      purchaseDate: new Date(Date.now() - (i * 7 + 1) * 24 * 60 * 60 * 1000).toISOString() // 1-21 days ago
    });
  }
  
  return Promise.resolve(portfolio);
};
