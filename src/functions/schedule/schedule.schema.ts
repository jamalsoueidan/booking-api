import mongoose, { Model, ObjectId, Schema } from "mongoose";
import {
  Schedule,
  ScheduleInterval,
  ScheduleProduct,
  ScheduleSlot,
} from "./schedule.types";

export const ProductSchema = new mongoose.Schema<ScheduleProduct>({
  productId: {
    type: Number,
    unique: true,
    index: true,
  },
  visibile: {
    type: Boolean,
    default: true,
  },
});

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
      unique: true,
      index: true,
    },
    intervals: [IntervalSchema],
  },
  { timestamps: true }
);

export interface IScheduleDocument extends Omit<Schedule, "_id">, Document {
  addSlot(slot: Omit<ScheduleSlot, "_id">): Promise<this>;
  updateSlot(
    slotId: mongoose.Types.ObjectId | string,
    updatedSlot: ScheduleSlot
  ): Promise<this>;
}

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
  products: [ProductSchema],
});

ScheduleMongooseSchema.methods.addSlot = function (slot: ScheduleSlot) {
  this.slots.push(slot);
  return this.save();
};

ScheduleMongooseSchema.methods.updateSlot = function (
  slotId: string | ObjectId,
  updatedSlot: ScheduleSlot
) {
  const slotIndex = this.slots.findIndex(
    (slot: ScheduleSlot) => slot._id.toString() === slotId.toString()
  );

  if (slotIndex === -1) {
    throw new Error("Slot not found");
  }

  this.slots[slotIndex] = updatedSlot;
  return this.save();
};
