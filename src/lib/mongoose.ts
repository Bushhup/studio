import mongoose from 'mongoose';

let isConnected = false; // Variable to track the connection status

export const connectToDB = async () => {
  // Set strict query mode for Mongoose to prevent unknown field queries.
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    console.error('FATAL_ERROR: MONGODB_URI is not defined in the environment variables.');
    throw new Error('MONGODB_URI is not defined. Please add it to your .env file.');
  }

  // If the connection is already established, return without creating a new one.
  if (isConnected) {
    // console.log('=> using existing database connection');
    return;
  }

  try {
    // Attempt to connect to the database
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    console.log('=> New database connection established');
  } catch (error) {
    console.error('=> Error connecting to database:', error);
    // Re-throwing the error is important to let the calling function know about the failure.
    throw new Error('Failed to connect to the database.');
  }
};
