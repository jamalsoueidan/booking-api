import mongoose, { Document, Model } from "mongoose";
import { PayoutLog } from "./payout-log.types";

export interface IPayoutLog extends Omit<PayoutLog, "_id"> {
  updatedAt: Date;
}

export interface IPayoutLogDocument extends IPayoutLog, Document {}

export const PayoutLogMongooseSchema = new mongoose.Schema<
  IPayoutLogDocument,
  Model<IPayoutLogDocument>
>(
  {
    customerId: {
      type: Number,
      required: true,
    },
    lineItemId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Payout",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PayoutLogMongooseSchema.index(
  { customerId: 1, lineItemId: 1 },
  { unique: true }
);
