import { Document, Model, Schema, Types } from "mongoose";
import { Tag, TagKeys } from "../shift";
import { Product } from "./product.types";

type ProductMongooseUser = {
  userId: Types.ObjectId;
  tag: Tag;
};

export interface IProduct extends Omit<Product, "_id" | "users"> {
  users: Array<ProductMongooseUser>;
}

export interface IProductDocument extends IProduct, Document {}

export interface IProductModel extends Model<IProductDocument> {}

export const ProductMongooseSchema = new Schema<
  IProductDocument,
  IProductModel
>({
  active: {
    default: false,
    index: true,
    type: Boolean,
  },
  buffertime: {
    default: 0,
    type: Number,
  },
  collectionId: {
    index: true,
    required: true,
    type: Number,
  },
  duration: {
    default: 60,
    type: Number,
  },
  hidden: {
    default: false,
    index: true,
    type: Boolean,
  },
  imageUrl: String,
  productId: {
    index: true,
    required: true,
    type: Number,
  },
  users: [
    {
      userId: {
        ref: "user",
        required: true,
        unique: true,
        type: Schema.Types.ObjectId,
      },
      tag: {
        enum: TagKeys,
        required: true,
        type: String,
      },
    },
  ],
  title: String,
});
