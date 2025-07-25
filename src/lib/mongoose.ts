import mongoose from 'mongoose';

let isConnected = false; // Variable to track the connection status

export const connectToDB = async () => {
  // Set strict query mode for Mongoose to prevent unknown field queries.
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env file');
    throw new Error('MONGODB_URI is not defined in .env file. Please add it to your .env file.');
  }

  // If the connection is already established, return without creating a new one.
  if (isConnected) {
    console.log('=> using existing database connection');
    return;
  }

  try {
    // Attempt to connect to the database
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    console.log('=> new database connection established');
  } catch (error) {
    console.error('=> error connecting to database:', error);
    // Let's not re-throw here, but log it. The calling function will handle the fallout.
    // This can prevent crashes on initial load if DB is temporarily unavailable.
  }
};
