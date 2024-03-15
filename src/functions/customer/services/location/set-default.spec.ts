import { faker } from "@faker-js/faker";

import { createLocation } from "~/library/jest/helpers/location";
import { CustomerLocationServiceGet } from "./get";
import { CustomerLocationServiceSetDefault } from "./set-default";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationServiceDestroy", () => {
  it("Should be able to destroy location", async () => {
    const customerId = faker.number.int();

    const document = await createLocation({ customerId });

    await CustomerLocationServiceSetDefault({
      locationId: document._id.toString(),
      customerId: customerId,
    });

    const location = await CustomerLocationServiceGet({
      locationId: document._id.toString(),
      customerId: customerId,
    });

    expect(location.isDefault).toBe(true);
  });
});
