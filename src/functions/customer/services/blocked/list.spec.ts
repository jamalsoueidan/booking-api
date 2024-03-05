import { createUser } from "~/library/jest/helpers";
import { createBlocked } from "~/library/jest/helpers/blocked";
import { CustomerBlockedServiceList } from "./list";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerBlockedServiceList", () => {
  beforeAll(async () => {
    for (let i = 0; i < 17; i++) {
      await createBlocked({
        customerId: 7106990342471,
        start: new Date(`2023-11-${10 + i}`),
        end: new Date(`2023-11-${11 + i}`),
      });
    }
  });

  it("should return 5 blocked records for customer with correct pagination", async () => {
    const customer = await createUser({ customerId: 7106990342471 });

    let initialCursor = null;
    const {
      results: firstPage,
      totalCount,
      nextCursor,
    } = await CustomerBlockedServiceList({
      customerId: customer.customerId,
      limit: 5,
    });

    expect(totalCount).toBe(17);
    expect(firstPage.length).toBe(5);
    initialCursor = nextCursor;

    const { results: secondPage } = await CustomerBlockedServiceList({
      customerId: customer.customerId,
      limit: 5,
      nextCursor: initialCursor,
    });

    expect(secondPage.length).toBe(5);
  });
});
