import mongoose from "mongoose";
import { IShiftDocument, IShiftModel, ShiftSchema } from "./shift.schema";

export const ShiftModel = mongoose.model<IShiftDocument, IShiftModel>(
  "shift",
  ShiftSchema,
  "Shift"
);
