import mongoose, { Document, Model } from "mongoose";
import { PayoutAccount, PayoutAccountType } from "./payout-account.types";

export interface IPayoutAccount extends Omit<PayoutAccount, "_id"> {
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayoutAccountDocument extends IPayoutAccount, Document {}

export const PayoutAccountMongooseSchema = new mongoose.Schema<
  IPayoutAccountDocument,
  Model<IPayoutAccountDocument>
>(
  {
    customerId: {
      type: Number,
      required: true,
      index: true,
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
