import mongoose from "mongoose";
import { LocationTypes } from "~/functions/location/location.types";
import { ScheduleProduct, TimeUnit } from "../schedule.types";

export const ProductSchema = new mongoose.Schema<ScheduleProduct>(
  {
    productHandle: {
      type: String,
      index: true,
    },
    productId: {
      type: Number,
      index: true,
    },
    variantId: {
      type: Number,
      index: true,
    },
    selectedOptions: {
      name: String,
      value: String,
    },
    price: {
      amount: String,
      currencyCode: String,
    },
    compareAtPrice: {
      amount: String,
      currencyCode: String,
    },
    description: String,
    duration: {
      type: Number,
      default: 60,
    },
    breakTime: {
      type: Number,
      required: true,
    },
    noticePeriod: {
      value: { type: Number, default: 1 },
      unit: {
        type: String,
        enum: Object.values(TimeUnit),
        default: TimeUnit.HOURS,
      },
    },
    bookingPeriod: {
      value: { type: Number, default: 1 },
      unit: {
        type: String,
        enum: Object.values(TimeUnit),
        default: TimeUnit.MONTHS,
      },
    },
    locations: {
      type: [
        {
          location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: true,
          },
          locationType: {
            type: String,
            enum: [LocationTypes.ORIGIN, LocationTypes.DESTINATION],
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    _id: false,
  }
);
