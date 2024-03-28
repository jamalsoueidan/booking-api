import { createPayoutAccount } from "~/library/jest/helpers/payout-account";
import { CustomerPayoutAccountServiceDestroy } from "./destroy";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerPayoutAccountServiceDestroy", () => {
  it("should destroy payout account document", async () => {
    const payoutAccount = await createPayoutAccount();

    const payoutAccountDocument = await CustomerPayoutAccountServiceDestroy({
      payoutAccountId: payoutAccount.id,
      customerId: payoutAccount.customerId,
    });

    expect(payoutAccountDocument.deletedCount).toBe(1);
  });
});
