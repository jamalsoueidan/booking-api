import { PayoutAccountModel } from "~/functions/payout-account";

export type CustomerPayoutAccountServiceDestroyProps = {
  customerId: number;
};

export const CustomerPayoutAccountServiceDestroy = ({
  customerId,
}: CustomerPayoutAccountServiceDestroyProps) => {
  return PayoutAccountModel.deleteMany({
    customerId,
  });
};
