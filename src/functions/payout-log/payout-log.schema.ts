import mongoose, { Document, Model } from "mongoose";
import { PayoutLog, PayoutLogReferenceType } from "./payout-log.types";

export interface IPayoutLog extends Omit<PayoutLog, "_id"> {
  createdAt: Date;
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
    referenceType: {
      type: String,
      required: true,
      enum: [PayoutLogReferenceType.LINE_ITEM, PayoutLogReferenceType.SHIPPING],
    },
    referenceId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      unique: true,
    },
    orderId: {
      type: Number,
      required: true,
      index: true,
    },
    orderCreatedAt: Date,
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Payout",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PayoutLogMongooseSchema.index(
  { customerId: 1, referenceType: 1, referenceId: 1 },
  { unique: true }
);

PayoutLogMongooseSchema.index({ customerId: 1, payout: 1 }, { unique: false });
