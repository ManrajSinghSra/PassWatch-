const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false
    }).then(m => m);
  }
  
  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected');
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

module.exports = connectDB;