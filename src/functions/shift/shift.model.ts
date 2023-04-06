import mongoose from "mongoose";
import {
  IShiftDocument,
  IShiftModel,
  ShiftMongooseSchema,
} from "./shift.schema";

export const ShiftModel = mongoose.model<IShiftDocument, IShiftModel>(
  "shift",
  ShiftMongooseSchema,
  "Shift"
);
