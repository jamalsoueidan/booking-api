import { faker } from "@faker-js/faker";

import { createLocation } from "~/library/jest/helpers/location";
import { CustomerLocationServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationServiceGet", () => {
  it("Should be able to get location", async () => {
    const customerId = faker.number.int();

    const document = await createLocation({ customerId });

    let location = await CustomerLocationServiceGet({
      locationId: document._id.toString(),
      customerId: customerId,
    });

    expect(location).toBeDefined();
  });
});
