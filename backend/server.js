const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const twilioRoutes = require('./routes/twilioRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const morgan = require('morgan');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Logging middleware (morgan)
app.use(morgan('combined', { stream: require('fs').createWriteStream('./logs/app.log', { flags: 'a' }) }));

app.use('/api/auth', authRoutes);
app.use('/api/twilio', twilioRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const connectDB = require('./config/db');
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
