import { Model, model } from "mongoose";
import { ILocationDocument, LocationMongooseSchema } from "./location.schema";

export const LocationModel = model<ILocationDocument, Model<ILocationDocument>>(
  "location",
  LocationMongooseSchema,
  "Location"
);
