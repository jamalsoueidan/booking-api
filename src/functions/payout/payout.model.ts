import { Model, model } from "mongoose";
import { IPayoutDocument, PayoutMongooseSchema } from "./payout.schema";

export const PayoutModel = model<IPayoutDocument, Model<IPayoutDocument>>(
  "payout",
  PayoutMongooseSchema,
  "Payout"
);
