import mongoose, { Document, Model } from "mongoose";
import {
  Location,
  LocationOriginTypes,
  LocationTypes,
} from "../location.types";

export interface ILocation extends Location {
  geoLocation: {
    type: "Point";
    coordinates: Array<Number>;
  };
  handle: string;
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
    name: {
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
    fullAddress: {
      type: String,
      required: true,
    },
    originType: {
      type: String,
      enum: [LocationOriginTypes.HOME, LocationOriginTypes.COMMERCIAL],
      default: LocationOriginTypes.COMMERCIAL,
      required: true,
    },
    minDistanceForFree: {
      type: Number,
      default: 0,
    },
    distanceHourlyRate: {
      type: Number,
      default: 0,
    },
    fixedRatePerKm: {
      type: Number,
      default: 0,
    },
    handle: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);
