import mongoose from "mongoose";
import { ScheduleProduct } from "../schedule.types";

export const ProductSchema = new mongoose.Schema<ScheduleProduct>(
  {
    productId: {
      type: Number,
      index: true,
    },
    visibile: {
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
  },
  {
    _id: false,
  }
);
