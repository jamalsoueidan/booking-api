const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer = "";

beforeAll(async () => {
  console.log("Starting MongoDB instance...");
  console.time();
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.timeEnd();

  try {
    console.time();
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.timeEnd();
  } catch (error) {
    console.error("Connection to MongoDB failed:", error);
    process.exit(1);
  }
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  console.time();
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  console.timeEnd();
});
