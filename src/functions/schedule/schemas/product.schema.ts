import mongoose from "mongoose";
import { ScheduleProduct, TimeUnit } from "../schedule.types";

export const ProductSchema = new mongoose.Schema<ScheduleProduct>(
  {
    productId: {
      type: Number,
      index: true,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    breakTime: {
      type: Number,
      required: true,
      default: 0, // default to 0 minutes if not provided
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
  },
  {
    _id: false,
  }
);
