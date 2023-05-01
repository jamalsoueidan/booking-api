import { Document, Model, Schema } from "mongoose";
import { Product } from "./product.types";

export interface IProduct extends Omit<Product, "_id"> {}

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
  duration: {
    default: 60,
    type: Number,
  },
  hidden: {
    default: false,
    index: true,
    type: Boolean,
  },
  image: {
    url: String,
    width: Number,
    height: Number,
  },
  productId: {
    index: true,
    required: true,
    unique: true,
    type: Number,
  },
  title: String,
});
