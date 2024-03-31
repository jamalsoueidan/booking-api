import { PayoutModel } from "~/functions/payout";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type CustomerPayoutServiceGetProps = {
  customerId: number;
  payoutId: StringOrObjectId;
};

export const CustomerPayoutServiceGet = async ({
  customerId,
  payoutId,
}: CustomerPayoutServiceGetProps) => {
  return PayoutModel.findOne({
    _id: payoutId,
    customerId,
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId", "payoutId"],
        message: "PAYOUT_NOT_FOUND",
        code: "custom",
      },
    ])
  );
};
