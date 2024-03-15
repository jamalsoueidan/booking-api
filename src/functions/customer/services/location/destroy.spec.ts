import { faker } from "@faker-js/faker";

import { createLocation } from "~/library/jest/helpers/location";
import { CustomerLocationServiceDestroy } from "./destroy";
import { CustomerLocationServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationServiceDestroy", () => {
  it("Should be able to destroy location", async () => {
    const customerId = faker.number.int();

    const document = await createLocation({ customerId });

    let location = await CustomerLocationServiceGet({
      locationId: document._id.toString(),
      customerId: customerId,
    });

    expect(location).toBeDefined();

    await CustomerLocationServiceDestroy({
      locationId: document._id.toString(),
      customerId: customerId,
    });

    await expect(
      CustomerLocationServiceGet({
        locationId: document._id.toString(),
        customerId: customerId,
      })
    ).rejects.toThrow();
  });
});
