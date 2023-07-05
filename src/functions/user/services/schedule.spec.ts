import { faker } from "@faker-js/faker";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services";
import { LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
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
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation(
      { customerId },
      { locationType: LocationTypes.DESTINATION }
    );

    const schedule1 = await CustomerScheduleServiceCreate({
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

    const schedule2 = await CustomerScheduleServiceCreate({
      name: faker.name.firstName(),
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
      name: faker.name.firstName(),
      customerId,
      products: [],
    });

    const schedules = await UserScheduleServiceLocationsList({
      customerId,
    });

    expect(schedules).toHaveLength(0);
  });

  it("should get schedule with products only belongs to specific locationId", async () => {
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation(
      { customerId },
      { locationType: LocationTypes.DESTINATION }
    );

    const schedule = await CustomerScheduleServiceCreate({
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

    const getSchedule = await UserScheduleServiceGet({
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
