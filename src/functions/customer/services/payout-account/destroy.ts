import mongoose from "mongoose";
import { PayoutAccountModel } from "~/functions/payout-account";
import { StringOrObjectId } from "~/library/zod";

export type CustomerPayoutAccountServiceDestroyProps = {
  payoutAccountId: StringOrObjectId;
  customerId: number;
};

export const CustomerPayoutAccountServiceDestroy = ({
  payoutAccountId,
  customerId,
}: CustomerPayoutAccountServiceDestroyProps) => {
  return PayoutAccountModel.deleteOne({
    _id: new mongoose.Types.ObjectId(payoutAccountId),
    customerId,
  });
};
