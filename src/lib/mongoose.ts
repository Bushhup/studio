import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) {
    // console.log('=> using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    
    // console.log('=> creating new database connection');
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
      // console.log('=> New database connection established');
      return mongooseInstance;
    }).catch(error => {
        console.error('=> Error connecting to database:', error);
        // Making sure the promise is rejected on error, and cache is cleared
        cached.promise = null; 
        throw error;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Clear promise on error to allow retry
    throw e;
  }
  
  return cached.conn;
}
