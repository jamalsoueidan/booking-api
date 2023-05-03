import mongoose, { Document, Model, Schema } from "mongoose";
import { BadError } from "~/library/handler";
import { Schedule, ScheduleProduct, ScheduleSlot } from "../schedule.types";
import { BlockDateSchema } from "./block-date.schema";
import { ProductSchema } from "./product.schema";
import { SlotSchema, validateSlots } from "./slot.schema";

export interface IScheduleDocument extends Omit<Schedule, "_id">, Document {
  updateSlots(
    this: IScheduleDocument,
    updatedSlot: ScheduleSlot[]
  ): Promise<this>;
  removeProduct(this: IScheduleDocument, productId: number): Promise<this>;
  createOrUpdateProduct(
    this: IScheduleDocument,
    product: ScheduleProduct
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
  blockDates: [BlockDateSchema],
});

ScheduleMongooseSchema.methods.updateSlots = function (
  this: IScheduleDocument,
  updatedSlot: ScheduleSlot[]
) {
  this.slots = updatedSlot;
  return this.save();
};

ScheduleMongooseSchema.methods.removeProduct = async function (
  this: IScheduleDocument,
  productId: number
): Promise<IScheduleDocument> {
  this.products = this.products.filter((p) => p.productId !== productId);
  return this.save();
};

ScheduleMongooseSchema.methods.createOrUpdateProduct = async function (
  this: IScheduleDocument,
  updatedProduct: ScheduleProduct
): Promise<IScheduleDocument> {
  const productIndex = this.products.findIndex(
    (p) => p.productId === updatedProduct.productId
  );

  if (productIndex !== -1) {
    this.products[productIndex] = updatedProduct;
  } else {
    this.products.push(updatedProduct);
  }
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
          message: "ProductId must be unique across all schedules",
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
  validateSlots(this.slots);
  next();
});
