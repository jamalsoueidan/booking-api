import { PayoutAccountModel } from "~/functions/payout-account";

export type CustomerPayoutAccountServiceGetProps = {
  customerId: number;
};

export const CustomerPayoutAccountServiceGet = ({
  customerId,
}: CustomerPayoutAccountServiceGetProps) => {
  return PayoutAccountModel.findOne({
    customerId,
  });
};
