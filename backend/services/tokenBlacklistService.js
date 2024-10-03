const TokenBlacklist = require('../models/tokenBlacklist');

/**
 * Blacklist a token
 * @param {string} token - The token to blacklist
 * @param {string} userId - The ID of the user associated with the token
 * @returns {Promise<void>}
 */
const blacklistToken = async (token, userId) => {
  try {
    await TokenBlacklist.create({ token, userId });
  } catch (error) {
    console.error('Error blacklisting token:', error.message);
    throw new Error('Could not blacklist token');
  }
};

/**
 * Check if a token is blacklisted
 * @param {string} token - The token to check
 * @returns {Promise<boolean>}
 */
const isTokenBlacklisted = async (token) => {
  try {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    return blacklistedToken !== null;
  } catch (error) {
    console.error('Error checking blacklisted token:', error.message);
    throw new Error('Could not check blacklisted token');
  }
};

/**
 * Remove expired tokens from the blacklist (optional)
 * This is automatically handled by MongoDB TTL feature, but you could implement manual cleanup if needed.
 */
const cleanupBlacklistedTokens = async () => {
  try {
    // This function can be called periodically if you want additional cleanup logic.
    console.log('Cleanup of blacklisted tokens is not necessary due to MongoDB TTL.');
  } catch (error) {
    console.error('Error during cleanup of blacklisted tokens:', error.message);
  }
};

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklistedTokens
};
