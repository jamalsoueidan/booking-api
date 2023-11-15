import { faker } from "@faker-js/faker";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";
import { LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { UserScheduleServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserScheduleServiceGet", () => {
  const customerId = 123;
  const username = "test";

  beforeEach(() => createUser({ customerId }, { username }));

  it("should get schedule with products only belongs to specific locationId", async () => {
    const locationOrigin = await createLocation({ customerId });
    const locationDestination = await createLocation({
      customerId,
      locationType: LocationTypes.DESTINATION,
    });

    const schedule = await CustomerScheduleServiceCreate({
      name: faker.person.firstName(),
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
