import { faker } from "@faker-js/faker";

import { createLocation } from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerProductServiceAdd } from "../product/add";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerLocationServiceGetProducts } from "./get-products";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerLocationServiceGetProducts", () => {
  it("Should be able to get products assoicated with this location", async () => {
    const customerId = faker.number.int();

    const location1 = await createLocation({ customerId });

    const newSchedule1 = await CustomerScheduleServiceCreate({
      name: "Test Schedule",
      customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule1.customerId,
      },
      {
        ...getProductObject({
          locations: [
            {
              location: location1._id,
              locationType: location1.locationType,
              originType: location1.originType,
            },
          ],
        }),
        scheduleId: newSchedule1._id,
      }
    );

    const newSchedule2 = await CustomerScheduleServiceCreate({
      name: "Test1 Schedule",
      customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
      },
      {
        ...getProductObject({
          locations: [
            {
              location: location1._id,
              locationType: location1.locationType,
              originType: location1.originType,
            },
          ],
        }),
        scheduleId: newSchedule2._id,
      }
    );

    const products = await CustomerLocationServiceGetProducts({
      customerId,
      locationId: location1._id,
    });

    expect(products).toHaveLength(2);
  });
});
