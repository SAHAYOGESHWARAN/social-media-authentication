const express = require('express');
const { sendVerificationEmail, verifyEmail } = require('../controllers/emailController');
const { body, validationResult } = require('express-validator'); // For request validation
const rateLimit = require('express-rate-limit'); // For rate limiting

const router = express.Router();

// Rate limiting middleware for sending verification emails
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Validate input for sending verification email
const validateEmailSend = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address.'),
];

// Route to send verification email
router.post('/verify-email/send', emailLimiter, validateEmailSend, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await sendVerificationEmail(req, res);
});

// Route to verify email using token
router.get('/verify-email', async (req, res) => {
  const { token } = req.query; // Assuming the token is sent as a query parameter
  if (!token) {
    return res.status(400).json({ message: 'Token is required.' });
  }
  await verifyEmail(req, res);
});

module.exports = router;
