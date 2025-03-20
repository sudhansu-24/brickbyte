const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  marketDemandScore: { type: Number, default: 50 }, // 0-100 scale
  historicalPrices: [{
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  aiPredictedPrice: { type: Number },
  roi: { type: Number },
  lastPriceUpdate: { type: Date },
  priceHistory: [{
    price: { type: Number },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Property location is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  totalTokens: {
    type: Number,
    required: [true, 'Total tokens must be specified'],
    min: 1
  },
  tokensAvailable: {
    type: Number,
    required: true
  },
  tokenPrice: {
    type: Number,
    required: [true, 'Token price must be specified'],
    min: 0
  },
  owner: {
    type: String,
    required: [true, 'Property owner wallet address is required'],
    trim: true
  },
  rentalIncome: {
    type: Number,
    required: [true, 'Monthly rental income must be specified'],
    min: 0
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to set initial tokens available
propertySchema.pre('save', function(next) {
  if (this.isNew) {
    this.tokensAvailable = this.totalTokens;
  }
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
