const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { sendOTP, verifyOTP, resetPasswordRequest, resetPassword } = require('../controllers/twilioController');
const protect = require('../middleware/authMiddleware');
const { getUserProfile } = require('../controllers/userController');


const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// 2FA: Send OTP
router.post('/2fa/send', sendOTP);

// 2FA: Verify OTP
router.post('/2fa/verify', verifyOTP);

// Password reset request
router.post('/reset-password/request', resetPasswordRequest);

// Reset password
router.post('/reset-password', resetPassword);

// Protected route example
router.get('/profile', protect, getUserProfile);

module.exports = router;
