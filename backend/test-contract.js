const { ethers } = require('ethers');

// SimplePropertyToken contract ABI - simplified version with just the functions we need
const contractABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function getTokenPrice() view returns (uint256)",
  "function getAvailableTokens() view returns (uint256)"
];

async function main() {
  try {
    // Connect to local Hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    
    // Get the first account from the Hardhat node
    const accounts = await provider.listAccounts();
    console.log('Available accounts:', accounts);
    
    // Use the mock contract address from server.js
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    // Test read-only functions
    try {
      const name = await contract.name();
      console.log('Contract name:', name);
    } catch (error) {
      console.error('Error getting contract name:', error.message);
    }
    
    try {
      const symbol = await contract.symbol();
      console.log('Contract symbol:', symbol);
    } catch (error) {
      console.error('Error getting contract symbol:', error.message);
    }
    
    try {
      const tokenPrice = await contract.getTokenPrice();
      console.log('Token price:', ethers.formatEther(tokenPrice), 'ETH');
    } catch (error) {
      console.error('Error getting token price:', error.message);
    }
    
    try {
      const availableTokens = await contract.getAvailableTokens();
      console.log('Available tokens:', availableTokens.toString());
    } catch (error) {
      console.error('Error getting available tokens:', error.message);
    }
    
    console.log('\nContract test completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
