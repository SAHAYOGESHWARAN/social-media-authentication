const express = require('express');
const { requestPasswordReset, resetPassword ,sendVerificationOTP, verifyPhoneNumber } = require('../controllers/twilioController');

const router = express.Router();

// Route to request a password reset (sends OTP)
router.post('/reset-password/request', requestPasswordReset);

// Route to reset the password using OTP
router.post('/reset-password', resetPassword);

// Route to send OTP for phone verification
router.post('/verify-phone/send', sendVerificationOTP);

// Route to verify phone number using OTP
router.post('/verify-phone', verifyPhoneNumber);

module.exports = router;
