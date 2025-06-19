// This file is no longer needed as MongoDB integration is being removed.
// You can safely delete this file from your project.
// If you try to import from this file, your application will error.

const message = "MongoDB integration has been removed. This file (src/lib/mongodb.ts) should be deleted.";
console.warn(message);

// Throw an error to ensure this file isn't accidentally used.
export async function connectToDatabase(): Promise<any> {
  throw new Error(message);
}

export default Promise.reject(new Error(message));
