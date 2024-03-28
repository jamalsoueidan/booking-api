import { PayoutAccountType } from "~/functions/payout-account";
import { CustomerPayoutAccountServiceCreate } from "./create";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerPayoutAccountServiceCreate", () => {
  it("should create payout account document", async () => {
    const customerId = 7106990342471;
    const payoutDetails = {
      phoneNumber: 1212121,
    };
    const payoutType = PayoutAccountType.MOBILE_PAY;
    const blockedDocuments = await CustomerPayoutAccountServiceCreate({
      customerId,
      payoutDetails,
      payoutType,
    });

    expect(blockedDocuments.customerId).toEqual(customerId);
    expect(blockedDocuments.payoutDetails).toEqual(payoutDetails);
    expect(blockedDocuments.payoutType).toEqual(payoutType);
  });

  it("should throw error if payout details is invalid", async () => {
    const customerId = 7106990342471;
    const payoutDetails = {
      phoneNumber: 1212121,
    };
    const payoutType = PayoutAccountType.BANK_ACCOUNT;

    await expect(
      CustomerPayoutAccountServiceCreate({
        customerId,
        payoutDetails,
        payoutType,
      })
    ).rejects.toThrow();
  });
});
