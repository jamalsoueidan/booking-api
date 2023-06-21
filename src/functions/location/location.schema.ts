import mongoose, { Document, Model } from "mongoose";
import { Location, LocationTypes } from "./location.types";

export interface ILocation extends Omit<Location, "_id"> {
  createdAt: Date;
  updatedAt: Date;
  geoLocation: {
    type: "Point";
    coordinates: number[];
  };
}

export interface ILocationDocument extends ILocation, Document {}

export interface ILocationModel extends Model<ILocationDocument> {}

export const LocationMongooseSchema = new mongoose.Schema<
  ILocationDocument,
  ILocationModel
>(
  {
    locationType: {
      type: String,
      enum: [
        LocationTypes.RESIDENTIAL,
        LocationTypes.COMMERICAL,
        LocationTypes.CLIENT,
      ],
      required: true,
    },
    fullAddress: {
      type: String,
      required: true,
    },
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true }
);
