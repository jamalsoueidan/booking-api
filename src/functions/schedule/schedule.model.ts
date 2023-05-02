import mongoose from "mongoose";
import {
  IScheduleDocument,
  IScheduleModel,
  ScheduleMongooseSchema,
} from "./schedule.schema";

export const ScheduleModel = mongoose.model<IScheduleDocument, IScheduleModel>(
  "schedule",
  ScheduleMongooseSchema,
  "Schedule"
);
