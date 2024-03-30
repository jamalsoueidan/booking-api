import { PayoutAccount, PayoutAccountModel } from "~/functions/payout-account";

export const CustomerPayoutAccountServiceCreate = (props: PayoutAccount) => {
  const created = new PayoutAccountModel(props);
  return created.save();
};
