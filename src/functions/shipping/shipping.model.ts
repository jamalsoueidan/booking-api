import { Model, model } from "mongoose";
import { IShippingDocument, ShippingMongooseSchema } from "./shipping.schema";

export const ShippingModel = model<IShippingDocument, Model<IShippingDocument>>(
  "shipping",
  ShippingMongooseSchema,
  "Shipping"
);
