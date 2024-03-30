import mongoose, { Document, Model } from "mongoose";
import { PayoutAccountType } from "../payout-account/payout-account.types";
import { Payout, PayoutStatus } from "./payout.types";

export interface IPayout extends Omit<Payout, "_id"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayoutDocument extends IPayout, Document {}

export const PayoutMongooseSchema = new mongoose.Schema<
  IPayoutDocument,
  Model<IPayoutDocument>
>(
  {
    customerId: {
      type: Number,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
    },
    currencyCode: {
      type: String,
      default: "DKK",
    },
    status: {
      type: String,
      required: true,
      enum: [PayoutStatus.FAILED, PayoutStatus.PENDING, PayoutStatus.PROCESSED],
      default: PayoutStatus.PENDING,
    },
    payoutType: {
      type: String,
      required: true,
      enum: [PayoutAccountType.BANK_ACCOUNT, PayoutAccountType.MOBILE_PAY],
    },
    payoutDetails: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);
