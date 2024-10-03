const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema with additional fields
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'], // E.164 format
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  isVerified: {
    type: Boolean,
    default: false, // Indicates if the user has verified their phone/email
  },
  resetOTP: {
    type: String,
    select: false, // Exclude from queries by default
  },
  otpExpiry: {
    type: Date,
    select: false, // Exclude from queries by default
  },
  deletedAt: {
    type: Date,
    default: null, // Used for soft deletion
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12); // Increased salt rounds for enhanced security
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Soft delete user by setting deletedAt
userSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  await this.save();
};

// Restore soft-deleted user
userSchema.methods.restore = async function () {
  this.deletedAt = null;
  await this.save();
};

// Create a static method to find active users
userSchema.statics.findActiveUsers = async function () {
  return this.find({ deletedAt: null }); // Return users who are not soft deleted
};

const User = mongoose.model('User', userSchema);
module.exports = User;
