import mongoose from "mongoose";

export const connect = async () => {
  if (mongoose.connection.readyState !== 1) {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env["CosmosDbConnectionString"] || "");
  }
};

export type MongooseCatchError = {
  index: number;
  code: number;
  keyPattern: {
    [key: string]: unknown;
  };
  keyValue: {
    [key: string]: string;
  };
};

export const isMongooseError = (
  error: MongooseCatchError | unknown
): error is MongooseCatchError => {
  return (error as MongooseCatchError).code !== undefined;
};
