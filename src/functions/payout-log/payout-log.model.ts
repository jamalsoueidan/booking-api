import { Model, model } from "mongoose";
import {
  IPayoutLogDocument,
  PayoutLogMongooseSchema,
} from "./payout-log.schema";

export const PayoutLogModel = model<
  IPayoutLogDocument,
  Model<IPayoutLogDocument>
>("payout-log", PayoutLogMongooseSchema, "PayoutLog");
