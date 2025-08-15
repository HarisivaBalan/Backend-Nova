const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_LOCAL_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected to the host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDb;
