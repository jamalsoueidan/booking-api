import { faker } from "@faker-js/faker";

import { createLocation } from "~/library/jest/helpers/location";
import { CustomerLocationServiceList } from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationServiceList", () => {
  it("Should be able to get all locations for user", async () => {
    const customerId = faker.number.int();

    await createLocation({ customerId });
    await createLocation({ customerId });
    await createLocation({ customerId });

    const locations = await CustomerLocationServiceList({
      customerId,
    });

    expect(locations).toHaveLength(3);
  });
});
