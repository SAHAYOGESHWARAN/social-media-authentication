const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { sendOTP, verifyOTP, resetPasswordRequest, resetPassword } = require('../controllers/twilioController');
const protect = require('../middleware/authMiddleware');
const { getUserProfile } = require('../controllers/userController');
const { body, validationResult } = require('express-validator'); // For request validation
const rateLimit = require('express-rate-limit'); // For rate limiting

const router = express.Router();

// Rate limiting middleware for login and registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Validate input for registration
const validateRegister = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long.')
    .trim(),
  body('phoneNumber')
    .isMobilePhone() // Assuming a valid mobile phone format
    .withMessage('Please provide a valid phone number.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

// Validate input for login
const validateLogin = [
  body('phoneNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

// Register route
router.post('/register', validateRegister, authLimiter, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await registerUser(req, res);
});

// Login route
router.post('/login', validateLogin, authLimiter, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await loginUser(req, res);
});

// 2FA: Send OTP
router.post('/2fa/send', protect, async (req, res) => {
  await sendOTP(req, res);
});

// 2FA: Verify OTP
router.post('/2fa/verify', protect, async (req, res) => {
  await verifyOTP(req, res);
});

// Password reset request
router.post('/reset-password/request', async (req, res) => {
  await resetPasswordRequest(req, res);
});

// Reset password
router.post('/reset-password', async (req, res) => {
  await resetPassword(req, res);
});

// Protected route example
router.get('/profile', protect, getUserProfile);

module.exports = router;
