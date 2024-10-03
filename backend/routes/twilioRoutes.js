const express = require('express');
const { requestPasswordReset, resetPassword } = require('../controllers/twilioController');

const router = express.Router();

// Route to request a password reset (sends OTP)
router.post('/reset-password/request', requestPasswordReset);

// Route to reset the password using OTP
router.post('/reset-password', resetPassword);

module.exports = router;
