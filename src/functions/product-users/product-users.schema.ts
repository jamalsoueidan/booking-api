import { Document, Model, Schema, Types } from "mongoose";
import { TagKeys } from "../shift";
import { ProductUsers } from "./product-users.types";

export interface IProductUsers extends Omit<ProductUsers, "_id" | "userId"> {
  userId: Types.ObjectId;
}

export interface IProductUsersDocument extends IProductUsers, Document {}

export interface IProductUsersModel extends Model<IProductUsersDocument> {}

export const ProductUsersMongooseSchema = new Schema<
  IProductUsersDocument,
  IProductUsersModel
>({
  productId: {
    index: true,
    required: true,
    type: Number,
  },
  userId: {
    ref: "user",
    index: true,
    required: true,
    type: Schema.Types.ObjectId,
  },
  tag: {
    index: true,
    enum: TagKeys,
    required: true,
    type: String,
  },
});
