import mongoose, { Document, Model } from "mongoose";
import {
  PayoutAccount,
  PayoutAccountBankZodSchema,
  PayoutAccountMobilePayZodSchema,
  PayoutAccountType,
} from "./payout-account.types";

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

PayoutAccountMongooseSchema.pre<IPayoutAccountDocument>(
  "save",
  async function (next) {
    const payoutDetails = this.payoutDetails;
    const payoutType = this.payoutType;

    try {
      if (payoutType === PayoutAccountType.BANK_ACCOUNT) {
        PayoutAccountBankZodSchema.parse(payoutDetails);
      } else if (payoutType === PayoutAccountType.MOBILE_PAY) {
        PayoutAccountMobilePayZodSchema.parse(payoutDetails);
      } else {
        throw new Error(`Unsupported payout type: ${payoutType}`);
      }
      next();
    } catch (error) {
      next(
        new Error(
          `Validation failed for payoutDetails: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
    }
  }
);
