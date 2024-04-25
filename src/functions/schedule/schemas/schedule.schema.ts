import mongoose, { Document, Model, Schema } from "mongoose";
import { BadError } from "~/library/handler";
import { Schedule, ScheduleSlot } from "../schedule.types";
import { ProductSchema, validateProducts } from "./product.schema";
import { SlotSchema, validateSlots } from "./slot.schema";

export interface IScheduleDocument extends Omit<Schedule, "_id">, Document {
  updateSlots(
    this: IScheduleDocument,
    updatedSlot: ScheduleSlot[]
  ): Promise<this>;
  removeProduct(this: IScheduleDocument, productId: number): Promise<this>;
}

export type IScheduleModel = Model<IScheduleDocument>;

export const ScheduleMongooseSchema = new Schema<
  IScheduleDocument,
  IScheduleModel
>(
  {
    name: {
      type: String,
      index: true,
    },
    customerId: {
      type: Number,
      index: true,
    },
    slots: [SlotSchema],
    products: [ProductSchema],
  },
  { timestamps: true }
);

ScheduleMongooseSchema.methods.updateSlots = function (
  this: IScheduleDocument,
  updatedSlot: ScheduleSlot[]
) {
  this.slots = updatedSlot;
  return this.save();
};

ScheduleMongooseSchema.pre<IScheduleDocument>("save", async function (next) {
  try {
    const existingScheduleWithProduct = await mongoose
      .model("schedule")
      .findOne({
        customerId: this.customerId,
        products: {
          $elemMatch: {
            productId: {
              $in: this.products.map((product) => product.productId),
            },
          },
        },
      });

    if (
      existingScheduleWithProduct &&
      existingScheduleWithProduct._id.toString() !== this._id.toString()
    ) {
      throw new BadError([
        {
          code: "custom",
          message: "ProductId must be unique across all schedules user",
          path: ["products"],
        },
      ]);
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

ScheduleMongooseSchema.pre<IScheduleDocument>("save", async function (next) {
  try {
    const existingScheduleWithProduct = await mongoose
      .model("schedule")
      .findOne({
        customerId: this.customerId,
        name: this.name,
      });

    if (
      existingScheduleWithProduct &&
      existingScheduleWithProduct._id.toString() !== this._id.toString()
    ) {
      throw new BadError([
        {
          code: "custom",
          message: "name must be unique across all schedules user",
          path: ["name"],
        },
      ]);
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

ScheduleMongooseSchema.pre<IScheduleDocument>("save", async function (next) {
  validateSlots(this.slots);
  validateProducts(this.products);
  next();
});
