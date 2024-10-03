const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  const connect = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,  // Ensures index creation for Mongoose schema fields
        useFindAndModify: false, // Disable deprecated findAndModify
        poolSize: 10,           // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Timeout after 5s if not connected
        socketTimeoutMS: 45000,  // Close sockets after 45 seconds of inactivity
      });
      console.log('MongoDB connected');
    } catch (error) {
      console.error(`MongoDB connection failed: ${error.message}`);

      retries += 1;
      if (retries < maxRetries) {
        console.log(`Retrying connection... Attempt ${retries}/${maxRetries}`);
        setTimeout(connect, 5000); // Retry after 5 seconds
      } else {
        console.error('Maximum retry attempts reached. Exiting process.');
        process.exit(1);
      }
    }
  };

  await connect();
};

module.exports = connectDB;
