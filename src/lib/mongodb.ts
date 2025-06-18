// src/lib/mongodb.ts
import { MongoClient, Db, ServerApiVersion, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'mca_department_db';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

interface CustomGlobal extends NodeJS.Global {
    _mongoClientPromise?: Promise<MongoClient>;
}
declare const global: CustomGlobal;


if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    } as MongoClientOptions);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
  } as MongoClientOptions);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<Db> {
  if (!clientPromise) {
    throw new Error("MongoDB client promise not initialized");
  }
  const mongoClient = await clientPromise;
  return mongoClient.db(dbName);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, a client can be shared across functions.
export default clientPromise;
