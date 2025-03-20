const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  yieldEarned: { type: Number, default: 0 },
  lastYieldPaid: { type: Date },
  yieldHistory: [{
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    amount: { type: Number },
    timestamp: { type: Date, default: Date.now }
  }],
  stakedTokens: [{
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    amount: { type: Number, default: 0 },
    stakedAt: { type: Date, default: Date.now },
    lastRewardClaim: { type: Date }
  }],
  stakingRewards: { type: Number, default: 0 },
  governanceVotes: { type: Number, default: 0 },
  tokensHeld: [{
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    amount: { type: Number, default: 0 },
    purchasePrice: { type: Number },
    purchaseDate: { type: Date, default: Date.now }
  }],
  totalValue: { type: Number, default: 0 },
  rentalIncome: { type: Number, default: 0 },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  role: {
    type: [String],
    default: []
  },
  stakedTokens: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
