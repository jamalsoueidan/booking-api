import { addDays, format, isEqual } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { LocationTypes } from "~/functions/location";

import { WeekDays } from "~/functions/schedule";
import { arrayElements, createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { UserAvailabilityServiceGenerate } from "./generate";
import { UserAvailabilityServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserAvailabilityServiceGet", () => {
  const customerId = 1;
  let user: Awaited<ReturnType<typeof createUser>>;
  let schedule: Awaited<ReturnType<typeof createSchedule>>;
  let locationOrigin: Awaited<ReturnType<typeof createLocation>>;
  let locationDestination: Awaited<ReturnType<typeof createLocation>>;

  const todayInUTC = utcToZonedTime(new Date(), "Etc/UTC");

  const nextDayInUTC = format(
    addDays(todayInUTC, 1),
    "iiii"
  ).toLowerCase() as WeekDays;

  const days = [nextDayInUTC];

  beforeEach(async () => {
    user = await createUser({ customerId });

    locationOrigin = await createLocation({
      customerId,
      locationType: LocationTypes.ORIGIN,
    });

    locationDestination = await createLocation({
      customerId,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      locationType: LocationTypes.DESTINATION,
    });

    schedule = await createSchedule(
      { customerId },
      {
        totalProducts: 2,
        days,
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
