import mongoose from "mongoose";
import { ScheduleInterval, ScheduleSlot } from "../schedule.types";

export const IntervalSchema = new mongoose.Schema<ScheduleInterval>(
  {
    to: String,
    from: String,
  },
  {
    _id: false,
  }
);

export const SlotSchema = new mongoose.Schema<ScheduleSlot>(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      index: true,
    },
    intervals: [IntervalSchema],
  },
  { timestamps: true, _id: false }
);
