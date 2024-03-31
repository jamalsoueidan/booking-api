import { PayoutModel } from "~/functions/payout";
import { StringOrObjectId } from "~/library/zod";

export type CustomerPayoutServiceGetProps = {
  customerId: number;
  payoutId: StringOrObjectId;
};

export const CustomerPayoutServiceGet = async ({
  customerId,
  payoutId,
}: CustomerPayoutServiceGetProps) => {
  return PayoutModel.aggregate([
    {
      $match: {
        _id: payoutId,
        customerId,
      },
    },
  ]);
};
