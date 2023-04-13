import mongoose from "mongoose";
import { CartMongooseSchema, ICartDocument, ICartModel } from "./cart.schema";

export const CartModel = mongoose.model<ICartDocument, ICartModel>(
  "cart",
  CartMongooseSchema,
  "Cart"
);
