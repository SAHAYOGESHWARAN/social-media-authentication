const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const twilioRoutes = require('./routes/twilioRoutes');
const userRoutes = require('./routes/userRoutes'); // Assuming you have user routes
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies

// Logging middleware (Morgan)
const logStream = fs.createWriteStream(path.join(__dirname, './logs/app.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream }));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/users', userRoutes); // User routes

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
