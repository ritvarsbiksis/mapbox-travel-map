import { MongoClient, ServerApiVersion } from 'mongodb'

if (!process.env.DB_CONN_STRING) {
  throw new Error('Invalid/Missing environment variable: "DB_CONN_STRING"')
}

if (
  !process.env.DB_NAME ||
  !process.env.DEVICES_COLLECTION_NAME ||
  !process.env.RECEIVED_DATA_COLLECTION_NAME
) {
  throw new Error(
    'Invalid/Missing environment variables - DB_CONN_STRING, DEVICES_COLLECTION_NAME, RECEIVED_DATA_COLLECTION_NAME',
  )
}

const uri = process.env.DB_CONN_STRING
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
