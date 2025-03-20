const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Skip connection in test environment as it's handled by mongodb-memory-server
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
