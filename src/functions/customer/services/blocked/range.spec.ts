import { isWithinInterval } from "date-fns";
import { createUser } from "~/library/jest/helpers";
import { createBlocked } from "~/library/jest/helpers/blocked";
import { CustomerBlockedServiceRange } from "./range";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerBlockedServiceRange", () => {
  beforeAll(async () => {
    await createBlocked({
      customerId: 7106990342471,
      start: new Date("2023-11-25"),
      end: new Date("2023-11-27"),
    });
    await createBlocked({
      customerId: 7106990342471,
      start: new Date("2023-12-15"),
      end: new Date("2023-12-20"),
    });
    // outside range
    await createBlocked({
      customerId: 7106990342471,
      start: new Date("2024-01-08"),
      end: new Date("2024-01-10"),
    });
  });

  it("should return blockeds for customer", async () => {
    const customer = await createUser({ customerId: 7106990342471 });

    const start = new Date("2023-11-26T00:00:00+03:00");
    const end = new Date("2024-01-07T00:00:00+03:00");
    const blockedDocuments = await CustomerBlockedServiceRange({
      customerId: customer.customerId,
      start,
      end,
    });

    const range = { start, end };
    const allInOrIntersectRange = blockedDocuments.every(
      (doc) =>
        isWithinInterval(new Date(doc.start), range) ||
        isWithinInterval(new Date(doc.end), range) ||
        (new Date(doc.start) < start && new Date(doc.end) > end)
    );

    expect(blockedDocuments.length).toBe(2);
    expect(allInOrIntersectRange).toBe(true);
  });
});
