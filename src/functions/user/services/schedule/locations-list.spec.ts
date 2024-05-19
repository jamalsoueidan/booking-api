import { faker } from "@faker-js/faker";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";
import { LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { UserScheduleServiceLocationsList } from "./locations-list";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserScheduleServiceLocationsList", () => {
  const customerId = 123;
  const username = "test";

  beforeEach(() => createUser({ customerId }, { username }));

  it("should return all locations present in schedules", async () => {
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });

    const schedule1 = await CustomerScheduleServiceCreate({
      name: faker.person.lastName(),
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

    const schedule2 = await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId,
      products: [
        getProductObject({
          locations: [
            getDumbLocationObject({
              location: locationOrigin._id,
              ...locationOrigin,
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

    await CustomerScheduleServiceCreate({
      name: faker.person.fullName(),
      customerId,
      products: [],
    });

    const schedules = await UserScheduleServiceLocationsList({
      customerId,
    });

    expect(schedules).toHaveLength(2);

    const schedule = schedules.find(
      (s) => s._id.toString() === schedule1._id.toString()
    );

    const allLocationIds = schedule?.locations.map((location) => {
      return location._id.toString();
    });

    expect(schedule?.locations).toHaveLength(2);

    expect(allLocationIds).toContain(locationOrigin._id.toString());
    expect(allLocationIds).toContain(locationDestination._id.toString());
  });

  it("should return none schedules when schedule does not contain any products", async () => {
    await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
      customerId,
      products: [],
    });

    const schedules = await UserScheduleServiceLocationsList({
      customerId,
    });

    expect(schedules).toHaveLength(0);
  });
});
