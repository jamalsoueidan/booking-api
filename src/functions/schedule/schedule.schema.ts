import mongoose, { Model, Schema } from "mongoose";
import { Schedule, ScheduleInterval, ScheduleSlot } from "./schedule.types";

export const IntervalSchema = new mongoose.Schema<ScheduleInterval>({
  to: String,
  from: String,
});

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
    },
    intervals: [IntervalSchema],
  },
  { timestamps: true }
);

export type IScheduleDocument = Omit<Schedule, "_id"> & Document;
export type IScheduleModel = Model<IScheduleDocument>;

export const ScheduleMongooseSchema = new Schema<
  IScheduleDocument,
  IScheduleModel
>({
  name: {
    type: String,
    unique: true,
    index: true,
  },
  customerId: {
    type: Number,
    index: true,
  },
  slots: [SlotSchema],
});
