import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  walletAddress?: string;
  nonce: number;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  walletAddress: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  nonce: {
    type: Number,
    required: true,
    default: () => Math.floor(Math.random() * 1000000),
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Update lastLogin on each authentication
userSchema.pre('save', function(this: IUser, next) {
  if (this.isModified('nonce')) {
    this.lastLogin = new Date();
  }
  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
