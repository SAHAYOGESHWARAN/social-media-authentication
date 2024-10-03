const express = require('express');
const { sendVerificationEmail, verifyEmail } = require('../controllers/emailController');

const router = express.Router();

// Route to send verification email
router.post('/verify-email/send', sendVerificationEmail);

// Route to verify email using token
router.get('/verify-email', verifyEmail);

module.exports = router;
