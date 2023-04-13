import mongoose from "mongoose";
import {
  ISettingDocument,
  ISettingModel,
  SettingMongooseSchema,
} from "./setting.schema";

export const SettingModel = mongoose.model<ISettingDocument, ISettingModel>(
  "setting",
  SettingMongooseSchema,
  "Setting"
);

// should be moved to setup steps first time
SettingModel.createCollection().then(async (collection) => {
  const count = await collection.countDocuments();
  if (count === 0) {
    collection.insertMany([
      {
        language: "da",
        status: true,
        timeZone: "Europe/Copenhagen",
      },
    ]);
  }
});
