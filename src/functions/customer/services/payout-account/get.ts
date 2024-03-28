import { PayoutAccountModel } from "~/functions/payout-account";
import { NotFoundError } from "~/library/handler";

export type CustomerPayoutAccountServiceGetProps = {
  customerId: number;
};

export const CustomerPayoutAccountServiceGet = ({
  customerId,
}: CustomerPayoutAccountServiceGetProps) => {
  return PayoutAccountModel.findOne({
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
