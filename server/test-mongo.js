import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load server/.env
dotenv.config({ path: './.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in server/.env');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

mongoose.connect(uri, {
  // Let mongoose pick defaults; ensure compatibility
})
  .then(() => {
    console.log('✅ MongoDB connection successful');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(2);
  });
