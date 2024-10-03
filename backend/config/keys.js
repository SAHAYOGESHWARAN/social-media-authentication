const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const getKeys = () => {
  const keys = {
    // Database connection string
    MONGO_URI: process.env.MONGO_URI,
    
    // Twilio credentials
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,

    // JWT secrets
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

    // Application port
    PORT: process.env.PORT || 5000,

    // Additional keys for other services can be added here
  };

  // Check for required keys and throw an error if not found
  const requiredKeys = ['MONGO_URI', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  requiredKeys.forEach(key => {
    if (!keys[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  });

  return keys;
};

module.exports = getKeys();
