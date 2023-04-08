import mongoose from "mongoose";
import {
  IProductDocument,
  IProductModel,
  ProductMongooseSchema,
} from "./product.schema";

export const ProductModel = mongoose.model<IProductDocument, IProductModel>(
  "product",
  ProductMongooseSchema,
  "Product"
);
