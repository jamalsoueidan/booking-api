import mongoose from "mongoose";
import { PayoutAccountModel } from "~/functions/payout-account";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type CustomerPayoutAccountServiceGetProps = {
  payoutAccountId: StringOrObjectId;
  customerId: number;
};

export const CustomerPayoutAccountServiceGet = ({
  payoutAccountId,
  customerId,
}: CustomerPayoutAccountServiceGetProps) => {
  return PayoutAccountModel.findOne({
    _id: new mongoose.Types.ObjectId(payoutAccountId),
    customerId,
  }).orFail(
    new NotFoundError([
      {
        path: ["payoutAccountId", "customerId"],
        message: "PAYOUT_ACCUONT_NOT_FOUND",
        code: "custom",
      },
    ])
  );
};
