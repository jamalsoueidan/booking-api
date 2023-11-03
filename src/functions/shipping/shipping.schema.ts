import mongoose, { Document, Model } from "mongoose";
import { Shipping } from "./shipping.types";

export interface IShipping extends Omit<Shipping, "_id"> {
  expireAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShippingDocument extends IShipping, Document {}

export const ShippingMongooseSchema = new mongoose.Schema<
  IShippingDocument,
  Model<IShippingDocument>
>(
  {
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },
    origin: {
      /*------------------*/
      /* we are moving these information from location, in case the user changes them while booking an appointment */
      /*------------------*/
      customerId: {
        type: Number,
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
      },
      fullAddress: {
        type: String,
        required: true,
      },
      minDriveDistance: {
        type: Number,
        default: 0,
      },
      maxDriveDistance: {
        type: Number,
        default: 500,
      },
      distanceForFree: {
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
      startFee: {
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
    cost: {
      text: String,
      value: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);
