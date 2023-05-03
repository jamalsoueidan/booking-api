import { Model, Schema } from "mongoose";
import { Schedule, ScheduleSlot } from "../schedule.types";
import { BlockDateSchema } from "./block-date.schema";
import { ProductSchema } from "./product.schema";
import { SlotSchema } from "./slot.schema";

export interface IScheduleDocument extends Omit<Schedule, "_id">, Document {
  updateSlots(updatedSlot: ScheduleSlot[]): Promise<this>;
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
  blockDates: [BlockDateSchema],
});

ScheduleMongooseSchema.methods.updateSlots = function (
  updatedSlot: ScheduleSlot
) {
  this.slots = updatedSlot;
  return this.save();
};
