import { faker } from "@faker-js/faker";
import { LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { UserScheduleServiceGetByLocation } from "./get-by-location";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserScheduleServiceGetByLocation", () => {
  const customerId = 123;
  const username = "test";

  beforeEach(() => createUser({ customerId }, { username }));

  it("should retrieve a schedule with products that only belong to a specific locationId", async () => {
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });

    const schedule = await createSchedule({
      name: faker.person.firstName(),
      customerId,
      products: [
        getProductObject({
          locations: [
            getDumbLocationObject({
              location: locationOrigin._id,
              ...locationOrigin,
            }),
            getDumbLocationObject({
              location: locationDestination._id,
              ...locationDestination,
            }),
          ],
        }),
        getProductObject({
          locations: [
            getDumbLocationObject({
              location: locationOrigin._id,
              ...locationOrigin,
            }),
          ],
        }),
      ],
    });

    const getSchedule = await UserScheduleServiceGetByLocation({
      username,
      locationId: locationDestination._id,
      scheduleId: schedule._id,
    });

    expect(getSchedule._id.toString()).toEqual(schedule._id.toString());

    const allHaveLocationId = getSchedule.products.every((product) =>
      product.locations.some(
        (location) =>
          location._id.toString() === locationDestination._id.toString()
      )
    );

    expect(allHaveLocationId).toBe(true);
  });
});
