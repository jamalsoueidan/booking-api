import mongoose, { Document, Model } from "mongoose";
import { Lookup } from "./lookup.type";

export interface ILookup extends Omit<Lookup, "_id"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface ILookupDocument extends ILookup, Document {}

export const LookupMongooseSchema = new mongoose.Schema<
  ILookupDocument,
  Model<ILookupDocument>
>(
  {
    origin: {
      customerId: {
        type: Number,
        required: true,
        index: true,
      },
      location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
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
    },
    destination: {
      name: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
        required: true,
      },
    },
    duration: {
      text: String,
      value: Number,
    },
    distance: {
      text: String,
      value: Number,
    },
  },
  { timestamps: true }
);
