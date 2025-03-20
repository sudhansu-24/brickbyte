const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, { message: 'User already exists' }, 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      walletAddress
    });

    // Generate token
    const token = generateToken(user._id);

    return successResponse(res, { data: { ...user.toObject(), password: undefined }, token }, 'User registered successfully', 201);
  } catch (error) {
    return errorResponse(res, error, 400);
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    return successResponse(res, { data: { ...user.toObject(), password: undefined }, token }, 'Login successful');
  } catch (error) {
    return errorResponse(res, error, 400);
  }
};

// Get User Profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    const userData = user.toObject();
    delete userData.password;
    return successResponse(res, { data: userData });
  } catch (error) {
    return errorResponse(res, error, 400);
  }
};

module.exports = {
  register,
  login,
  getMe
};
