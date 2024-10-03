const express = require('express');
const {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  refreshAccessToken,
  logout,
} = require('../services/tokenService'); // Adjust the path as necessary

const router = express.Router();

// Login route example
router.post('/login', async (req, res) => {
  // Validate user credentials
  // If valid:
  const userId = 'some_user_id'; // Replace with actual user ID
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  res.json({ accessToken, refreshToken });
});

// Refresh token route
router.post('/token/refresh', refreshAccessToken);

// Logout route
router.post('/logout', logout);

module.exports = router;
