const User = require('../models/User');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Request password reset (send OTP)
exports.requestPasswordReset = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in the user document (hash for security)
    const salt = await bcrypt.genSalt(12);
    const hashedOTP = await bcrypt.hash(otp, salt);
    user.resetOTP = hashedOTP;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10-minute expiry
    await user.save();

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your password reset OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error requesting password reset:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { phoneNumber, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check if OTP is valid and not expired
    if (!user.resetOTP || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP expired or invalid' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    user.resetOTP = undefined; // Clear OTP fields after use
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Send OTP for phone verification
exports.sendVerificationOTP = async (req, res) => {
    const { phoneNumber } = req.body;
  
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Store OTP in the user document
      const salt = await bcrypt.genSalt(12);
      const hashedOTP = await bcrypt.hash(otp, salt);
      user.verificationOTP = hashedOTP;
      user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10-minute expiry
      await user.save();
  
      // Send OTP via Twilio
      await client.messages.create({
        body: `Your verification OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
  
      res.status(200).json({ message: 'Verification OTP sent successfully' });
    } catch (error) {
      console.error('Error sending verification OTP:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  // Verify phone number using OTP
  exports.verifyPhoneNumber = async (req, res) => {
    const { phoneNumber, otp } = req.body;
  
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      // Check if OTP is valid and not expired
      if (!user.verificationOTP || user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: 'OTP expired or invalid' });
      }
  
      const isMatch = await bcrypt.compare(otp, user.verificationOTP);
      if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });
  
      // Mark the user as verified
      user.isVerified = true;
      user.verificationOTP = undefined;
      user.otpExpiry = undefined;
      await user.save();
  
      res.status(200).json({ message: 'Phone number verified successfully' });
    } catch (error) {
      console.error('Error verifying phone number:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  };
  