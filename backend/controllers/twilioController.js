const User = require('../models/User');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Send OTP (One-Time Password) for 2FA
exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

    await client.messages.create({
      body: `Your authentication OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    // Save OTP in user record for later verification
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await User.findOne({ phoneNumber, otp, otpExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // OTP is valid, authenticate user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// Password reset request
exports.resetPasswordRequest = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    await client.messages.create({
      body: `Use the following token to reset your password: ${resetToken}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    res.status(200).json({ message: 'Password reset token sent' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending reset token' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(400).json({ message: 'Invalid token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
};
