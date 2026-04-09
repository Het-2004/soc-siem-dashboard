/**
 * tests/setup.js — In-memory MongoDB setup for all test suites
 *
 * Uses mongodb-memory-server to spin up a real MongoDB instance
 * in RAM — no external DB needed, tests are fully isolated.
 * Also sets required environment variables for the test run.
 */

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Set env vars BEFORE any app module is loaded
// These mirror what's in .env but with test-safe values
process.env.JWT_SECRET      = "test-jwt-secret-do-not-use-in-production";
process.env.REFRESH_SECRET  = "test-refresh-secret-do-not-use-in-production";
process.env.ACCESS_TOKEN_EXPIRY  = "15m";
process.env.REFRESH_TOKEN_EXPIRY = "7d";
process.env.NODE_ENV             = "test";
process.env.INGEST_API_KEY       = ""; // will be overridden per-test suite

let mongod;

// Start in-memory MongoDB before ALL tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 60000); // 60s timeout — first startup downloads the binary

// Clear all collections between each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and stop in-memory server after ALL tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
}, 30000);
