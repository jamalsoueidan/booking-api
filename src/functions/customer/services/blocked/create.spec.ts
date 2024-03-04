import { createUser } from "~/library/jest/helpers";
import { CustomerBlockedServiceCreate } from "./create";
require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerBlockedServiceCreate", () => {
  it("should create blocked document", async () => {
    const customer = await createUser({ customerId: 7106990342471 });

    const start = new Date("2023-11-26T00:00:00+03:00");
    const end = new Date("2024-01-07T00:00:00+03:00");

    const blockedDocuments = await CustomerBlockedServiceCreate({
      customerId: 7106990342471,
      start,
      end,
    });

    expect(blockedDocuments.customerId).toEqual(7106990342471);
    expect(blockedDocuments.start).toEqual(start);
    expect(blockedDocuments.end).toEqual(end);
  });
});
