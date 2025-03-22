const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();

// Environment variables
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brickbyte';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
  walletAddress: { type: String, unique: true, required: true },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  propertyType: { type: String, required: true },
  tokenPrice: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  tokensAvailable: { type: Number, required: true },
  rentalIncome: { type: Number, required: true },
  projectedRoi: { type: Number, required: true },
  yearBuilt: { type: Number, required: true },
  squareFootage: { type: Number, required: true },
  lotSize: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  contractAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Property = mongoose.model('Property', PropertySchema);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (origin === 'http://localhost:3000') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve contract artifacts
app.use('/contracts', express.static(path.join(__dirname, 'src/contracts')));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running!' });
});

// Property routes
app.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
});

app.get('/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Error fetching property' });
  }
});

app.post('/properties/buy', async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    if (property.tokensAvailable < amount) {
      return res.status(400).json({ message: 'Not enough tokens available' });
    }
    
    // Update available tokens
    property.tokensAvailable -= amount;
    await property.save();
    
    res.json({
      success: true,
      message: `Successfully purchased ${amount} tokens for ${property.name}`,
      property
    });
  } catch (error) {
    console.error('Error buying property:', error);
    res.status(500).json({ message: 'Error buying property' });
  }
});

app.get('/properties/:id/contract', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json({
      contractAddress: property.contractAddress,
      tokenPrice: property.tokenPrice,
      tokensAvailable: property.tokensAvailable
    });
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ message: 'Error fetching contract' });
  }
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = new User({ walletAddress, name, email });
    await user.save();
    
    // Return user without sensitive data
    const { _id, walletAddress: address, name: userName, email: emailAddress } = user;
    
    res.status(201).json({
      user: { _id, address, userName, emailAddress },
      token: `mock-token-${user._id}`
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;
    
    // Verify signature
    const message = `Welcome to BrickByte! Please sign this message to verify your wallet ownership. Nonce: ${nonce}`;
    
    // TODO: Implement signature verification
    
    // Create or update user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress });
    }
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      success: true,
      user: {
        walletAddress,
        lastLogin: user.lastLogin.toISOString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Return user without sensitive data
    const { _id, walletAddress: address, name: userName, email: emailAddress } = user;
    
    res.json({
      user: { _id, address, userName, emailAddress },
      token: `mock-token-${user._id}`
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Extract user id from token
    const userId = token.split('-').pop();
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without sensitive data
    const { _id, walletAddress: address, name: userName, email: emailAddress } = user;
    
    res.json({ user: { _id, address, userName, emailAddress } });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

app.get('/auth/nonce/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Generate nonce
    const nonce = Math.random().toString(36).substring(2, 15);
    
    res.json({ nonce });
  } catch (error) {
    console.error('Nonce error:', error);
    res.status(500).json({ message: 'Error generating nonce' });
  }
});

app.get('/wallet/nonce/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Find user by wallet address or create a temporary nonce
    const user = await User.findOne({ walletAddress: address });
    const nonce = user ? user.nonce : Math.floor(Math.random() * 1000000);
    
    res.json({ nonce: String(nonce) });
  } catch (error) {
    console.error('Nonce error:', error);
    res.status(500).json({ message: 'Error generating nonce' });
  }
});

app.post('/wallet/verify', async (req, res) => {
  try {
    const { address, signature, nonce } = req.body;
    
    // Find user or create one for this wallet
    let user = await User.findOne({ walletAddress: address });
    
    if (!user) {
      user = new User({ walletAddress: address });
    }
    user.lastLogin = new Date();
    await user.save();
    
    // Return user without sensitive data
    const { _id, walletAddress: wallet, name: userName, email: emailAddress } = user;
    
    res.json({
      user: { _id, wallet, userName, emailAddress },
      token: `mock-token-${user._id}`
    });
  } catch (error) {
    console.error('Error verifying wallet:', error);
    res.status(500).json({ message: 'Error verifying wallet' });
  }
});

// Start server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running in development mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Start server
startServer();
