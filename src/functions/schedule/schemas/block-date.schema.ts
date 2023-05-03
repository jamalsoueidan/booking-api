import mongoose from "mongoose";
import { ScheduleBlockDate } from "../schedule.types";

export const BlockDateSchema = new mongoose.Schema<ScheduleBlockDate>(
  {
    start: {
      index: true,
      required: true,
      type: Date,
    },
    end: {
      index: true,
      required: true,
      type: Date,
    },
  },
  {
    _id: false,
  }
);
