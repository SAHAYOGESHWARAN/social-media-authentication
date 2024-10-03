const User = require('../models/User');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// JWT token generation
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Adjust expiry as needed
  });
};

// Register user
exports.registerUser = async (req, res) => {
  const { username, phoneNumber, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Password hashing
    const salt = await bcrypt.genSalt(12); // 12 rounds for better security
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      username,
      phoneNumber,
      password: hashedPassword, // Store hashed password
    });

    await user.save();

    // Send SMS using Twilio (error handling added)
    try {
      await client.messages.create({
        body: `Welcome ${username}! Thanks for registering.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    } catch (twilioError) {
      console.error('Error sending Twilio SMS:', twilioError);
      return res.status(500).json({ error: 'Error sending welcome SMS' });
    }

    // Generate JWT token
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user with rate-limiting to prevent brute-force attacks
let loginAttempts = {}; // Simple in-memory attempt tracker (can be replaced with Redis)

exports.loginUser = async (req, res) => {
  const { phoneNumber, password } = req.body;

  // Rate limiting logic to prevent brute-force attacks
  const currentTime = new Date().getTime();
  const windowTime = 15 * 60 * 1000; // 15-minute window
  const maxAttempts = 5;

  if (!loginAttempts[phoneNumber]) {
    loginAttempts[phoneNumber] = [];
  }

  // Remove outdated attempts
  loginAttempts[phoneNumber] = loginAttempts[phoneNumber].filter(
    (timestamp) => currentTime - timestamp < windowTime
  );

  // Check if the user has exceeded the max attempts
  if (loginAttempts[phoneNumber].length >= maxAttempts) {
    return res.status(429).json({
      message: 'Too many login attempts. Please try again later.',
    });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      loginAttempts[phoneNumber].push(currentTime);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      loginAttempts[phoneNumber].push(currentTime);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Reset login attempts on successful login
    loginAttempts[phoneNumber] = [];

    res.status(200).json({
      token,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Additional functions can be implemented, e.g., password reset, email verification, etc.
