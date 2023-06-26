import mongoose, { Document, Model } from "mongoose";
import { Location, LocationTypes } from "../location.types";

export interface ILocation extends Omit<Location, "_id"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocationDocument extends ILocation, Document {}

export const LocationMongooseSchema = new mongoose.Schema<
  ILocationDocument,
  Model<ILocationDocument>
>(
  {
    locationType: {
      type: String,
      enum: [LocationTypes.DESTINATION, LocationTypes.ORIGIN],
      required: true,
    },
    customerId: {
      type: Number,
      required: true,
      index: true,
    },
  },
  { timestamps: true, discriminatorKey: "locationType" }
);
