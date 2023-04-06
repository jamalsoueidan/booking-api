import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { Shift, Tag, TagKeys } from "./shift.types";

export interface IShift extends Omit<Shift, "_id" | "userId"> {
  userId: Types.ObjectId;
}

export interface IShiftDocument extends IShift, Document {}

export interface IShiftModel extends Model<IShiftDocument> {}

export const ShiftSchema = new mongoose.Schema<IShiftDocument, IShiftModel>({
  end: {
    index: true,
    required: true,
    type: Date,
  },
  groupId: String,
  userId: { index: true, ref: "user", type: Schema.Types.ObjectId },
  start: {
    index: true,
    required: true,
    type: Date,
  },
  tag: {
    default: Tag.weekday,
    enum: TagKeys,
    index: true,
    required: true,
    type: String,
  },
});
