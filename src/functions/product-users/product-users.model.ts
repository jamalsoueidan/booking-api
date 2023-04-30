import mongoose from "mongoose";
import {
  IProductUsersDocument,
  IProductUsersModel,
  ProductUsersMongooseSchema,
} from "./product-users.schema";

export const ProductUsersModel = mongoose.model<
  IProductUsersDocument,
  IProductUsersModel
>("product-users", ProductUsersMongooseSchema, "ProductUsers");
