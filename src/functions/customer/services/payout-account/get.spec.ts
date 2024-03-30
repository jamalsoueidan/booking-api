import { createPayoutAccount } from "~/library/jest/helpers/payout-account";
import { CustomerPayoutAccountServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerPayoutAccountServiceGet", () => {
  it("should get payout account document", async () => {
    const payoutAccount = await createPayoutAccount();

    const payoutAccountDocument = await CustomerPayoutAccountServiceGet({
      customerId: payoutAccount.customerId,
    });

    expect(payoutAccountDocument?.customerId).toEqual(payoutAccount.customerId);
    expect(payoutAccountDocument?.payoutDetails).toEqual(
      payoutAccount.payoutDetails
    );
    expect(payoutAccountDocument?.payoutType).toEqual(payoutAccount.payoutType);
  });
});
