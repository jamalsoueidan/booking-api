import { model } from "mongoose";
import {
  IOrderDocument,
  IOrderModel,
  OrdreMongooseSchema,
} from "./order.schema";

export const OrderModel = model<IOrderDocument, IOrderModel>(
  "order",
  OrdreMongooseSchema,
  "Order"
);
