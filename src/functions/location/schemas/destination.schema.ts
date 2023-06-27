import mongoose, { Model } from "mongoose";
import { LocationDestination } from "../location.types";
import { ILocation } from "./location.schema";

export interface ILocationDestination extends ILocation, LocationDestination {}
export interface ILocationDestinationDocument
  extends ILocationDestination,
    Document {}

export const LocationDestinationMongooseSchema = new mongoose.Schema<
  ILocationDestinationDocument,
  Model<ILocationDestinationDocument>
>(
  {
    name: {
      type: String,
      required: true,
    },
    minDistanceForFree: Number,
    distanceHourlyRate: Number,
    fixedRatePerKm: Number,
  },
  { _id: false }
);
