import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Collection, Document } from 'mongoose';
import { afterAll, beforeAll, beforeEach } from '@jest/globals';

let mongoMemServer: MongoMemoryServer;

beforeAll(async () => {
  mongoMemServer = await MongoMemoryServer.create();
  await mongoMemServer.ensureInstance();
  await mongoose.connect(mongoMemServer.getUri());
});

beforeEach(async () => {
  const allCollections = await mongoose.connection.db.collections();
  allCollections.forEach(async (collection) => {
    await collection.deleteMany({});
  })
});

afterAll(async () => {
  if (mongoMemServer)
    await mongoMemServer.stop();
  await mongoose.connection.close();
});