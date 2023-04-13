import mongoose, { Model, Types } from "mongoose";
import { Cart } from "./cart.types";

export interface ICart extends Omit<Cart, "_id" | "userId"> {
  userId: Types.ObjectId;
}

export interface ICartDocument extends ICart, Document {}

export interface ICartModel extends Model<ICartDocument> {}

export const CartMongooseSchema = new mongoose.Schema<
  ICartDocument,
  ICartModel
>({
  cartId: {
    index: true,
    required: true,
    type: String,
  },
  createdAt: {
    default: Date.now,
    expires: "15m",
    type: Date,
  },
  end: {
    index: true,
    required: true,
    type: Date,
  },
  userId: {
    ref: "user",
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  start: {
    index: true,
    required: true,
    type: Date,
  },
});
