import { faker } from "@faker-js/faker";
import { Payout, PayoutModel, PayoutStatus } from "~/functions/payout";

export const getPayoutObject = (
  props: Partial<Payout> = {}
): Omit<Payout, "_id"> => ({
  amount: faker.number.int({ min: 1, max: 10000000 }),
  currencyCode: "DKK",
  date: faker.date.between({ from: "2020-01-01", to: "2023-12-31" }),
  status: faker.helpers.arrayElement(Object.values(PayoutStatus)),
  customerId: faker.number.int({ min: 1, max: 10000000 }),
  payoutDetails: props.payoutDetails,
  payoutType: props.payoutType,
  ...props,
});

export const createPayout = (
  props: Partial<Payout> & Pick<Payout, "payoutDetails" | "payoutType"> = {}
) => {
  const payoutAccount = new PayoutModel(getPayoutObject({ ...props }));
  return payoutAccount.save();
};
