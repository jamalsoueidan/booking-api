import { faker } from "@faker-js/faker";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services";
import { createUser } from "~/library/jest/helpers";
import {
  createLocationDestination,
  createLocationOrigin,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import {
  UserScheduleServiceGet,
  UserScheduleServiceLocationsList,
} from "./schedule";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserScheduleService", () => {
  const customerId = 123;
  const username = "test";

  beforeEach(() => createUser({ customerId }, { username }));

  it("should return all schedules with locations and without products", async () => {
    const locationOrigin = await createLocationOrigin({ customerId });
    const locationDestination = await createLocationDestination({ customerId });

    await CustomerScheduleServiceCreate({
      name: faker.name.firstName(),
      customerId,
      products: [
        getProductObject({
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

    await CustomerScheduleServiceCreate({
      name: faker.name.firstName(),
      customerId,
      products: [
        getProductObject({
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
        }),
        getProductObject({
          locations: [
            {
              location: locationDestination._id,
              locationType: locationDestination.locationType,
            },
          ],
        }),
      ],
    });

    await CustomerScheduleServiceCreate({
      name: faker.name.firstName(),
      customerId,
      products: [],
    });

    const schedules = await UserScheduleServiceLocationsList({
      username,
    });

    expect(schedules).toHaveLength(2);

    const schedule = schedules[0];

    const allLocationIds = schedule.locations.map((location) => {
      return location._id.toString();
    });

    expect(schedule.locations).toHaveLength(2);

    expect(allLocationIds).toContain(locationOrigin._id.toString());
    expect(allLocationIds).toContain(locationDestination._id.toString());

    const findSchedule = await UserScheduleServiceGet({
      scheduleId: schedule._id,
      username,
      locationId: schedule.locations[1]._id,
    });

    // Check if the scheduleId matches
    expect(findSchedule._id.toString()).toEqual(schedule._id.toString());

    // Check if the customerId matches
    expect(findSchedule.customerId).toEqual(customerId);

    // Check if the products array exists and has at least one product
    expect(findSchedule.products.length).toBeGreaterThan(0);

    // Check if the product has locations
    expect(findSchedule.products[0].locations.length).toBeGreaterThan(0);

    // Check if the product's locations array includes the specified locationId
    const productLocationIds = findSchedule.products[0].locations.map((loc) =>
      loc.location.toString()
    );
    expect(productLocationIds).toContain(schedule.locations[1]._id.toString());
  });

  it("should return none schedules when schedule does not contain any products", async () => {
    await CustomerScheduleServiceCreate({
      name: faker.name.firstName(),
      customerId,
      products: [],
    });

    const schedules = await UserScheduleServiceLocationsList({
      username,
    });

    expect(schedules).toHaveLength(0);
  });
});
