const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getBlacklistedTokens, blacklistToken } = require('../models/tokenBlacklist'); // Assuming a model to track blacklisted tokens

// Generate access token
const generateAccessToken = (id, additionalData = {}) => {
  return jwt.sign(
    { id, ...additionalData },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token
const generateRefreshToken = (id) => {
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Save the refresh token securely (consider using a database)
  saveRefreshToken(id, refreshToken);
  
  return refreshToken;
};

// Function to save refresh tokens (could be implemented using a database)
const saveRefreshToken = async (userId, token) => {
  // Here, implement the logic to save the refresh token securely in a database or in-memory store
  // This can be a collection/table where you track refresh tokens associated with the user ID
};

// Middleware to verify access token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// Middleware to refresh token
const refreshAccessToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(401); // Unauthorized
  
  try {
    // Check if the token is blacklisted
    const isBlacklisted = await getBlacklistedTokens(token);
    if (isBlacklisted) return res.sendStatus(403); // Forbidden

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); // Forbidden

      const newAccessToken = generateAccessToken(user.id);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to blacklist tokens (for logout functionality)
const logout = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized
  
  await blacklistToken(token);
  res.sendStatus(204); // No Content
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authenticateToken,
  refreshAccessToken,
  logout,
};
