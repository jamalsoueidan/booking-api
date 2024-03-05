import { createUser } from "~/library/jest/helpers";
import { createBlocked } from "~/library/jest/helpers/blocked";
import { CustomerBlockedServiceDestroy } from "./destroy";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerBlockedServiceDestroy", () => {
  it("should destroy blocked document", async () => {
    const customer = await createUser({ customerId: 7106990342471 });

    const start = new Date("2023-11-26T00:00:00+03:00");
    const end = new Date("2024-01-07T00:00:00+03:00");

    const blocked = await createBlocked({
      customerId: 7106990342471,
      start,
      end,
      title: "asd",
    });

    const blockedDocuments = await CustomerBlockedServiceDestroy({
      blockedId: blocked._id,
      customerId: customer.customerId,
    });

    expect(blockedDocuments.deletedCount).toBe(1);
  });
});
