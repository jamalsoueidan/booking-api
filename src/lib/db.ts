import mongoose from "mongoose";

export const connect = async () => {
  if (mongoose.connection.readyState !== 1) {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env["CosmosDbConnectionString"] || "");
  }
};
