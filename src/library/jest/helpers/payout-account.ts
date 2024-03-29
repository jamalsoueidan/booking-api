import { faker } from "@faker-js/faker";
import {
  PayoutAccount,
  PayoutAccountModel,
  PayoutAccountType,
} from "~/functions/payout-account";

export const getPayoutAccountObject = (
  props: Partial<PayoutAccount> = {}
): Omit<PayoutAccount, "_id"> => ({
  payoutDetails: {
    phoneNumber: faker.number.int({ min: 1, max: 10000000 }),
  },
  payoutType: PayoutAccountType.MOBILE_PAY,
  customerId: faker.number.int({ min: 1, max: 10000000 }),
  ...props,
});

export const createPayoutAccount = (props: Partial<PayoutAccount> = {}) => {
  const payoutAccount = new PayoutAccountModel(
    getPayoutAccountObject({ ...props })
  );
  return payoutAccount.save();
};
