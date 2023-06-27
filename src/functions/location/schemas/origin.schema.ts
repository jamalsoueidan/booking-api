import mongoose, { Model } from "mongoose";
import { LocationDestinationTypes, LocationOrigin } from "../location.types";
import { ILocation } from "./location.schema";

export interface ILocationOrigin extends ILocation, LocationOrigin {
  geoLocation: {
    type: "Point";
    coordinates: Array<Number>;
  };
}
export interface ILocationOriginDocument extends ILocationOrigin, Document {}

export const LocationOriginMongooseSchema = new mongoose.Schema<
  ILocationOriginDocument,
  Model<ILocationOriginDocument>
>(
  {
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
    destinationType: {
      type: String,
      enum: [
        LocationDestinationTypes.HOME,
        LocationDestinationTypes.COMMERCIAL,
      ],
      default: LocationDestinationTypes.COMMERCIAL,
      required: true,
    },
  },
  {
    _id: false,
  }
);
