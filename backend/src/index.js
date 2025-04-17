require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { expressjwt } = require('express-jwt');
const { validateProperty, validateAuth } = require('./middleware/validate');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',  // Local development
    'https://brickbyte.vercel.app',  // Vercel frontend
    process.env.FRONTEND_URL  // Environment variable for additional domains
  ].filter(Boolean),  // Remove any undefined values
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Configure helmet with more permissive settings
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://brickbyte-backend.onrender.com", "https://brickbyte.vercel.app"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginEmbedderPolicy: false
}));

// Add error handling for CORS
app.use((err, req, res, next) => {
  if (err.name === 'CORS') {
    console.error('CORS Error:', err);
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Not allowed by CORS'
    });
  }
  next(err);
});

app.use(morgan('dev'));
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize public Supabase client (for non-admin operations)
const publicSupabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// JWT middleware
const jwtMiddleware = expressjwt({ 
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
}).unless({ path: ['/api/auth/login', '/api/auth/register'] });

// Apply JWT middleware
app.use('/api', jwtMiddleware);

// Authentication routes
app.post('/api/auth/register', validateAuth, async (req, res, next) => {
  try {
    const { email, password, walletAddress } = req.body;

    // First create the user with Supabase Auth using public client
    const { data: authData, error: authError } = await publicSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          wallet_address: walletAddress
        }
      }
    });

    if (authError) {
      throw authError;
    }

    // Auto-confirm the email using admin API
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    );

    if (confirmError) {
      throw confirmError;
    }

    // Store additional user data in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          wallet_address: walletAddress,
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: authData.user.id,
        email: authData.user.email,
        walletAddress
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        walletAddress
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', validateAuth, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Attempt to sign in using public client
    const { data: signInData, error: signInError } = await publicSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw signInError;
    }

    // Get user's wallet address from the database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', signInData.user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: signInData.user.id,
        email: signInData.user.email,
        walletAddress: profileData.wallet_address
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        walletAddress: profileData.wallet_address
      }
    });
  } catch (error) {
    next(error);
  }
});

// Properties endpoints
app.get('/api/properties', async (req, res, next) => {
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles:owner_id (
          id,
          email,
          wallet_address
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(properties);
  } catch (error) {
    next(error);
  }
});

app.get('/api/properties/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { data: property, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles:owner_id (
          id,
          email,
          wallet_address
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    next(error);
  }
});

app.post('/api/properties', validateProperty, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        ...req.body,
        owner_id: req.auth.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select(`
        *,
        profiles:owner_id (
          id,
          email,
          wallet_address
        )
      `);

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    next(error);
  }
});

// User routes
app.get('/api/user/profile', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.auth.userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Property trading routes
app.post('/api/properties/:id/buy', async (req, res, next) => {
  try {
    const { shares } = req.body;
    const propertyId = req.params.id;

    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if enough shares are available
    if (property.available_shares < shares) {
      return res.status(400).json({ error: 'Not enough shares available' });
    }

    // Check if user already has shares
    const { data: existingShares, error: sharesError } = await supabase
      .from('user_shares')
      .select('shares')
      .eq('user_id', req.auth.userId)
      .eq('property_id', propertyId)
      .single();

    if (sharesError && sharesError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw sharesError;
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        property_id: propertyId,
        user_id: req.auth.userId,
        type: 'BUY',
        shares,
        price_per_share: property.price_per_share,
        created_at: new Date().toISOString()
      }]);

    if (transactionError) throw transactionError;

    // Update user's share balance
    const newShares = (existingShares?.shares || 0) + shares;
    const { error: shareError } = await supabase
      .from('user_shares')
      .upsert([{
        user_id: req.auth.userId,
        property_id: propertyId,
        shares: newShares,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'user_id,property_id'
      });

    if (shareError) throw shareError;

    // Update property's available shares
    const { error: updateError } = await supabase
      .from('properties')
      .update({ 
        available_shares: property.available_shares - shares,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) throw updateError;

    res.status(201).json({ message: 'Shares purchased successfully' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/properties/:id/sell', async (req, res, next) => {
  try {
    const { shares } = req.body;
    const propertyId = req.params.id;

    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (propertyError) throw propertyError;
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Verify user has enough shares
    const { data: userShares, error: sharesError } = await supabase
      .from('user_shares')
      .select('shares')
      .eq('user_id', req.auth.userId)
      .eq('property_id', propertyId)
      .single();

    if (sharesError) throw sharesError;
    if (!userShares || userShares.shares < shares) {
      return res.status(400).json({ error: 'Insufficient shares' });
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        property_id: propertyId,
        user_id: req.auth.userId,
        type: 'SELL',
        shares,
        price_per_share: property.price_per_share,
        created_at: new Date().toISOString()
      }]);

    if (transactionError) throw transactionError;

    // Update user's share balance
    const newShareBalance = userShares.shares - shares;
    const { error: updateError } = await supabase
      .from('user_shares')
      .update({ 
        shares: newShareBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.auth.userId)
      .eq('property_id', propertyId);

    if (updateError) throw updateError;

    // Update property's available shares
    const { error: propertyUpdateError } = await supabase
      .from('properties')
      .update({ 
        available_shares: property.available_shares + shares,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (propertyUpdateError) throw propertyUpdateError;

    res.json({ message: 'Shares sold successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user's shares
app.get('/api/user/shares', async (req, res, next) => {
  try {
    console.log('Fetching user shares for user:', req.auth.userId);
    
    const { data, error } = await supabase
      .from('user_shares')
      .select(`
        shares,
        property_id,
        properties:property_id (
          id,
          name,
          location,
          price_per_share,
          rental_yield,
          image_url,
          total_shares
        )
      `)
      .eq('user_id', req.auth.userId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Found user shares:', JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error in /api/user/shares:', error);
    next(error);
  }
});

// Get user's transactions
app.get('/api/transactions', async (req, res, next) => {
  try {
    console.log('Fetching transactions for user:', req.auth.userId);
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        properties (
          name,
          location,
          price_per_share
        )
      `)
      .eq('user_id', req.auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Found transactions:', data);
    res.json(data || []);
  } catch (error) {
    console.error('Error in /api/transactions:', error);
    next(error);
  }
});

// Add verify token endpoint
app.get('/api/auth/verify', async (req, res, next) => {
  try {
    // The JWT middleware already verified the token
    // We just need to get the user data
    const userId = req.auth.userId;
    
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Apply error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 