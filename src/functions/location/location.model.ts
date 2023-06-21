import mongoose from "mongoose";
import {
  ILocationDocument,
  ILocationModel,
  LocationMongooseSchema,
} from "./location.schema";

export const LocationModel = mongoose.model<ILocationDocument, ILocationModel>(
  "location",
  LocationMongooseSchema,
  "Location"
);
