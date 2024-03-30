import { PayoutAccount, PayoutAccountModel } from "~/functions/payout-account";
import { CustomerPayoutAccountServiceDestroy } from "./destroy";

export const CustomerPayoutAccountServiceCreate = async (
  props: PayoutAccount
) => {
  await CustomerPayoutAccountServiceDestroy(props);
  const created = new PayoutAccountModel(props);
  return created.save();
};
