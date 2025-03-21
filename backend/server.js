const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins regardless of port
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve contract artifacts
app.use('/contracts', express.static(path.join(__dirname, 'src/contracts')));

// Mock database for testing
const users = [];
let nextId = 1;

// Mock property data with contract addresses
const properties = [
  {
    _id: '1',
    name: 'Skyline Towers',
    location: 'New York, NY',
    description: 'Luxury apartment complex in the heart of Manhattan with stunning views of the city skyline.',
    images: [
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ],
    propertyType: 'residential',
    tokenPrice: 100,
    totalTokens: 10000,
    tokensAvailable: 8500,
    rentalIncome: 5.2,
    projectedRoi: 8.7,
    yearBuilt: 2018,
    squareFootage: 5200,
    lotSize: '0.25 acres',
    bedrooms: 3,
    bathrooms: 2,
    contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Deployed contract address
    createdAt: '2023-01-15T08:30:00.000Z',
    updatedAt: '2023-01-15T08:30:00.000Z'
  },
  {
    _id: '2',
    name: 'Harbor View Office Complex',
    location: 'San Francisco, CA',
    description: 'Modern office complex with panoramic views of the San Francisco Bay and Golden Gate Bridge.',
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ],
    propertyType: 'commercial',
    tokenPrice: 250,
    totalTokens: 5000,
    tokensAvailable: 3200,
    rentalIncome: 6.8,
    projectedRoi: 9.5,
    yearBuilt: 2015,
    squareFootage: 12000,
    lotSize: '0.5 acres',
    bedrooms: 0,
    bathrooms: 8,
    contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Deployed contract address
    createdAt: '2023-02-20T10:15:00.000Z',
    updatedAt: '2023-02-20T10:15:00.000Z'
  },
  {
    _id: '3',
    name: 'Sunset Villas',
    location: 'Miami, FL',
    description: 'Beachfront luxury villas with private pools and direct access to the pristine white sand beaches.',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ],
    propertyType: 'residential',
    tokenPrice: 175,
    totalTokens: 7500,
    tokensAvailable: 5000,
    rentalIncome: 7.2,
    projectedRoi: 10.3,
    yearBuilt: 2021,
    squareFootage: 4800,
    lotSize: '0.4 acres',
    bedrooms: 4,
    bathrooms: 3,
    contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', // Deployed contract address
    createdAt: '2023-03-10T14:45:00.000Z',
    updatedAt: '2023-03-10T14:45:00.000Z'
  }
];

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running!' });
});

// Property routes
app.get('/properties', (req, res) => {
  res.json(properties);
});

app.get('/properties/:id', (req, res) => {
  const property = properties.find(p => p._id === req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }
  res.json(property);
});

app.post('/properties/buy', (req, res) => {
  const { propertyId, amount } = req.body;
  const property = properties.find(p => p._id === propertyId);
  
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }
  
  if (property.tokensAvailable < amount) {
    return res.status(400).json({ message: 'Not enough tokens available' });
  }
  
  // Update available tokens
  property.tokensAvailable -= amount;
  
  res.json({
    success: true,
    message: `Successfully purchased ${amount} tokens for ${property.name}`,
    property
  });
});

app.get('/properties/:id/contract', (req, res) => {
  const property = properties.find(p => p._id === req.params.id);
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }
  
  res.json({
    contractAddress: property.contractAddress,
    tokenPrice: property.tokenPrice,
    tokensAvailable: property.tokensAvailable
  });
});

// Auth routes
app.post('/auth/register', (req, res) => {
  const { name, email, password, walletAddress } = req.body;
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email || (walletAddress && u.walletAddress === walletAddress));
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  // Create user
  const user = {
    _id: String(nextId++),
    name,
    email,
    walletAddress,
    nonce: Math.floor(Math.random() * 1000000)
  };
  
  users.push(user);
  
  // Return user without sensitive data
  const { password: _, ...userResponse } = user;
  
  res.status(201).json({
    user: userResponse,
    token: `mock-token-${user._id}`
  });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Return user without sensitive data
  const { password: _, ...userResponse } = user;
  
  res.json({
    user: userResponse,
    token: `mock-token-${user._id}`
  });
});

app.get('/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Extract user id from token
  const userId = token.split('-').pop();
  const user = users.find(u => u._id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Return user without sensitive data
  const { password: _, ...userResponse } = user;
  
  res.json({ user: userResponse });
});

// Wallet routes
app.get('/wallet/nonce/:address', (req, res) => {
  const { address } = req.params;
  
  // Find user by wallet address or create a temporary nonce
  const user = users.find(u => u.walletAddress === address);
  const nonce = user ? user.nonce : Math.floor(Math.random() * 1000000);
  
  res.json({ nonce: String(nonce) });
});

app.post('/wallet/verify', (req, res) => {
  const { address, signature, nonce } = req.body;
  
  // Find user or create one for this wallet
  let user = users.find(u => u.walletAddress === address);
  
  if (!user) {
    user = {
      _id: String(nextId++),
      name: `Wallet User ${address.substring(0, 6)}`,
      email: `${address}@wallet.user`,
      walletAddress: address,
      nonce: Math.floor(Math.random() * 1000000)
    };
    users.push(user);
  }
  
  // Update nonce for next authentication
  user.nonce = Math.floor(Math.random() * 1000000);
  
  // Return user without sensitive data
  const { password: _, ...userResponse } = user;
  
  res.json({
    user: userResponse,
    token: `mock-token-${user._id}`
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
