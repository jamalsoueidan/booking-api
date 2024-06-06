import { faker } from "@faker-js/faker";

import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { CustomerLocationServiceGetProducts } from "./get-products";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationServiceGetProducts", () => {
  it("Should be able to get products assoicated with this location", async () => {
    const customerId = faker.number.int();

    const location1 = await createLocation({ customerId });

    const newSchedule1 = await createScheduleWithProducts({
      name: "Test Schedule",
      customerId,
      products: [
        {
          ...getProductObject({
            locations: [
              getDumbLocationObject({
                location: location1._id,
                locationType: location1.locationType,
              }),
            ],
          }),
        },
      ],
    });

    const newSchedule2 = await createScheduleWithProducts({
      name: "Test Schedule2",
      customerId,
      products: [
        {
          ...getProductObject({
            locations: [
              getDumbLocationObject({
                location: location1._id,
                locationType: location1.locationType,
              }),
            ],
          }),
        },
      ],
    });

    const products = await CustomerLocationServiceGetProducts({
      customerId,
      locationId: location1._id,
    });

    expect(products).toHaveLength(2);
  });
});
