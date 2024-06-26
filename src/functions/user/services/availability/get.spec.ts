import { addDays, format, isEqual } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { LocationTypes } from "~/functions/location";

import { SlotWeekDays } from "~/functions/schedule";
import { arrayElements, createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { UserAvailabilityServiceGenerate } from "./generate";
import { UserAvailabilityServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserAvailabilityServiceGet", () => {
  const customerId = 1;
  let user: Awaited<ReturnType<typeof createUser>>;
  let schedule: Awaited<ReturnType<typeof createScheduleWithProducts>>;
  let locationOrigin: Awaited<ReturnType<typeof createLocation>>;
  let locationDestination: Awaited<ReturnType<typeof createLocation>>;

  beforeAll(() => {
    jest
      .useFakeTimers({
        doNotFake: [
          "nextTick",
          "setImmediate",
          "clearImmediate",
          "setInterval",
          "clearInterval",
          "setTimeout",
          "clearTimeout",
        ],
      })
      .setSystemTime(new Date("2022-02-15"));
  });

  afterAll(() => {
    jest.useRealTimers(); // Go back to real timers
  });

  beforeEach(async () => {
    const todayInUTC = utcToZonedTime(new Date(), "Etc/UTC");

    const nextDayInUTC = format(
      addDays(todayInUTC, 1),
      "iiii"
    ).toLowerCase() as SlotWeekDays;

    const days = [nextDayInUTC];

    user = await createUser({ customerId });

    locationOrigin = await createLocation({
      customerId,
      locationType: LocationTypes.HOME,
    });

    locationDestination = await createLocation({
      customerId,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      locationType: LocationTypes.DESTINATION,
    });

    schedule = await createScheduleWithProducts(
      { customerId },
      {
        totalProducts: 2,
        days,
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
      }
    );
  });

  it("should only return available slots for requested slot", async () => {
    const productIds = arrayElements(schedule.products, 2).map(
      (product) => product.productId
    );

    const availabilities = await UserAvailabilityServiceGenerate(
      {
        username: user.username!,
        locationId: locationOrigin._id,
      },
      { productIds, fromDate: new Date().toISOString() }
    );

    const fromDate = availabilities[0].slots[0].from;
    const toDate = availabilities[0].slots[0].to;

    const availability = await UserAvailabilityServiceGet(
      {
        username: user.username!,
        locationId: locationOrigin._id,
      },
      {
        productIds,
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
      }
    );

    expect(isEqual(availability.slot?.from!, fromDate)).toBeTruthy();
    expect(isEqual(availability.slot?.to!, toDate)).toBeTruthy();
  });
});
