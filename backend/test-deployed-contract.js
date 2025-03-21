const { ethers } = require('ethers');

// ABI for the SimplePropertyToken contract
const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function getTokenPrice() view returns (uint256)",
  "function getAvailableTokens() view returns (uint256)",
  "function buyTokens(uint256 amount) payable"
];

async function main() {
  try {
    // Connect to local Hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log('Available accounts:', accounts[0].address);
    
    // Contract address from deployment
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    // Test read-only functions
    console.log('\nReading contract data:');
    
    const name = await contract.name();
    console.log('Contract name:', name);
    
    const symbol = await contract.symbol();
    console.log('Contract symbol:', symbol);
    
    const decimals = await contract.decimals();
    console.log('Decimals:', decimals);
    
    const totalSupply = await contract.totalSupply();
    console.log('Total supply:', ethers.formatEther(totalSupply), 'tokens');
    
    const tokenPrice = await contract.getTokenPrice();
    console.log('Token price:', ethers.formatEther(tokenPrice), 'ETH');
    
    const availableTokens = await contract.getAvailableTokens();
    console.log('Available tokens:', ethers.formatEther(availableTokens));
    
    // Test buying tokens
    console.log('\nTesting token purchase:');
    
    // Connect with a signer to make transactions
    const signer = accounts[1]; // Use a different account as buyer
    const connectedContract = contract.connect(signer);
    
    // Buy 5 tokens
    const tokensToBuy = 5;
    const value = tokenPrice * BigInt(tokensToBuy);
    
    console.log(`Buying ${tokensToBuy} tokens for ${ethers.formatEther(value)} ETH...`);
    
    const tx = await connectedContract.buyTokens(BigInt(tokensToBuy), { value });
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    // Check the balance after purchase
    const buyerBalance = await contract.balanceOf(signer.address);
    console.log(`Buyer balance after purchase: ${ethers.formatEther(buyerBalance)} tokens`);
    
    console.log('\nContract test completed successfully!');
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
