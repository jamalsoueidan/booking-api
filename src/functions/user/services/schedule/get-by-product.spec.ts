import { faker } from "@faker-js/faker";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";
import { LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { UserScheduleServiceGetByProductId } from "./get-by-product";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserScheduleServiceGetByProductId", () => {
  const customerId = 123;
  const username = "test";

  beforeEach(() => createUser({ customerId }, { username }));

  it("should retrieve a schedule and locations belonging to a specific productId, along with the product", async () => {
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });

    const product = getProductObject({
      locations: [
        {
          location: locationOrigin._id,
          locationType: locationOrigin.locationType,
        },
        {
          location: locationDestination._id,
          locationType: locationDestination.locationType,
        },
      ],
    });

    const schedule = await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId,
      products: [
        product,
        getProductObject({
          locations: [
            {
              location: locationOrigin._id,
              locationType: locationOrigin.locationType,
            },
          ],
        }),
        getProductObject({
          locations: [
            {
              location: locationOrigin._id,
              locationType: locationOrigin.locationType,
            },
          ],
        }),
      ],
    });

    // another fake schedule
    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId,
      products: [
        getProductObject({
          locations: [
            {
              location: locationOrigin._id,
              locationType: locationOrigin.locationType,
            },
          ],
        }),
      ],
    });

    const getSchedule = await UserScheduleServiceGetByProductId({
      customerId: schedule.customerId,
      productHandle: product.productHandle,
    });

    expect(getSchedule!.name).toBe(schedule.name);
    expect(getSchedule!._id.toString()).toBe(schedule._id.toString());
    expect(getSchedule!.locations.length).toBe(2);
    expect(getSchedule!.product.productId).toBe(product.productId);
  });
});
