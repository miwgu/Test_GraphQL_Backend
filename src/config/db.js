const mongoose = require('mongoose');
require('dotenv').config();
console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);  // Debugging

const db ={
    URI : process.env.MONGODB_URI || 'mongodb://localhost:27017/bookDB',
}

// MongoDB Connection
const connectDB = async () => {
    try {
      await mongoose.connect(db.URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log("Successfully MongoDB connected!");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1); // Exit the process if the connection fails
    }
  };

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB Connection Error: ${err.message}`);
});

  
  module.exports = connectDB;