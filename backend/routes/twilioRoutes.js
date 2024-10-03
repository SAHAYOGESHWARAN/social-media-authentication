const express = require('express');
const {
  requestPasswordReset,
  resetPassword,
  sendVerificationOTP,
  verifyPhoneNumber,
} = require('../controllers/twilioController');
const { body, validationResult } = require('express-validator'); // For request validation
const rateLimit = require('express-rate-limit'); // For rate limiting

const router = express.Router();

// Rate limiting middleware for sending OTPs and reset password requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Validate input for password reset request
const validatePasswordResetRequest = [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number.'),
];

// Validate input for password reset
const validateResetPassword = [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number.'),
  body('otp')
    .isLength({ min: 6 })
    .withMessage('OTP must be 6 digits long.'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

// Validate input for sending verification OTP
const validateSendVerificationOTP = [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number.'),
];

// Validate input for verifying phone number
const validateVerifyPhoneNumber = [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number.'),
  body('otp')
    .isLength({ min: 6 })
    .withMessage('OTP must be 6 digits long.'),
];

// Route to request a password reset (sends OTP)
router.post('/reset-password/request', otpLimiter, validatePasswordResetRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await requestPasswordReset(req, res);
});

// Route to reset the password using OTP
router.post('/reset-password', validateResetPassword, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await resetPassword(req, res);
});

// Route to send OTP for phone verification
router.post('/verify-phone/send', otpLimiter, validateSendVerificationOTP, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await sendVerificationOTP(req, res);
});

// Route to verify phone number using OTP
router.post('/verify-phone', validateVerifyPhoneNumber, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await verifyPhoneNumber(req, res);
});

module.exports = router;
