import { Model, model } from "mongoose";
import { ILocationDocument, LocationMongooseSchema } from "./schemas";

export const LocationModel = model<ILocationDocument, Model<ILocationDocument>>(
  "location",
  LocationMongooseSchema,
  "Location"
);
