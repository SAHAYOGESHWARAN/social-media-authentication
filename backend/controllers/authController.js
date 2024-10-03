const User = require('../models/User');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register user
exports.registerUser = async (req, res) => {
  const { username, phoneNumber, password } = req.body;

  try {
    let user = await User.findOne({ phoneNumber });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ username, phoneNumber, password });
    await user.save();

    // Send SMS using Twilio
    await client.messages.create({
      body: `Welcome ${username}!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    const token = generateToken(user._id);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
