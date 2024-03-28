import { Model, model } from "mongoose";
import {
  IPayoutAccountDocument,
  PayoutAccountMongooseSchema,
} from "./payout-account.schema";

export const PayoutAccountModel = model<
  IPayoutAccountDocument,
  Model<IPayoutAccountDocument>
>("payout-account", PayoutAccountMongooseSchema, "PayoutAccount");
