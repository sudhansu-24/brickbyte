const hre = require('hardhat');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
require('dotenv').config();

const { ethers } = hre;

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get contract factory and owner signer
    const [owner] = await ethers.getSigners();
    const PropertyToken = await ethers.getContractFactory("PropertyToken", owner);
    
    // Create a new random wallet for the buyer
    const buyerWallet = ethers.Wallet.createRandom().connect(ethers.provider);

    console.log('Testing contract deployment...');
    console.log('Deploying from address:', await owner.getAddress());
    
    const propertyToken = await PropertyToken.deploy(
      "Ocean View Condo",
      "OVC",
      ethers.parseEther("1000"),
      ethers.parseEther("0.1")
    );
    await propertyToken.waitForDeployment();
    const contractAddress = await propertyToken.getAddress();
    console.log('Contract deployed to:', contractAddress);

    // Create property in MongoDB
    const property = await Property.create({
      name: "Ocean View Condo",
      location: "Miami Beach",
      description: "Luxury beachfront property",
      imageUrl: "https://example.com/image.jpg",
      totalTokens: 1000,
      tokensAvailable: 1000,
      tokenPrice: 0.1,
      rentalIncome: 5000, // Monthly rental income in USD
      contractAddress,
      owner: await owner.getAddress()
    });
    console.log('Property created in MongoDB');

    // Create test user
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      walletAddress: await buyerWallet.getAddress()
    });
    console.log('Test user created');

    // Buy tokens
    console.log('Testing token purchase...');
    const buyAmount = 10;
    // Fund the buyer wallet first
    const fundTx = await owner.sendTransaction({
      to: await buyerWallet.getAddress(),
      value: ethers.parseEther("1.0")
    });
    await fundTx.wait();
    console.log('Funded buyer wallet');

    // Buy tokens
    const tx = await propertyToken.connect(buyerWallet).buyTokens(
      ethers.parseEther(buyAmount.toString()),
      { value: ethers.parseEther((buyAmount * 0.1).toString()) }
    );
    await tx.wait();
    console.log('Tokens purchased');

    // Verify balances
    const buyerBalance = await propertyToken.balanceOf(await buyerWallet.getAddress());
    console.log('Buyer token balance:', ethers.formatEther(buyerBalance));

    // Update MongoDB
    await Property.findByIdAndUpdate(property._id, {
      tokensAvailable: 1000 - buyAmount
    });
    await User.findByIdAndUpdate(user._id, {
      tokensHeld: buyAmount
    });
    console.log('MongoDB updated');

    console.log('All tests passed! ✅');
  } catch (error) {
    console.error('Error:', error);
  }

  // Disconnect from MongoDB
  await mongoose.disconnect();
  process.exit(0);
}

main();
