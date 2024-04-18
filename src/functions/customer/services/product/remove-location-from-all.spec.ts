import mongoose from "mongoose";

import { LocationTypes } from "~/functions/location";
import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerScheduleServiceGet } from "../schedule/get";
import { CustomerProductServiceAdd } from "./add";
import { CustomerProductServiceRemoveLocationFromAll } from "./remove-location-from-all";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceRemoveLocationFromAll", () => {
  const customerId = 123;
  const name = "Test Schedule";
  const productId = 1000;
  const newProduct = getProductObject({
    variantId: 1,
    duration: 60,
    breakTime: 0,
    noticePeriod: {
      value: 1,
      unit: TimeUnit.DAYS,
    },
    bookingPeriod: {
      value: 1,
      unit: TimeUnit.WEEKS,
    },
    locations: [],
  });

  it("should be able to remove one location from all products", async () => {
    const newSchedule1 = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    const locationRemoveId = new mongoose.Types.ObjectId().toString();
    await CustomerProductServiceAdd(
      {
        customerId: newSchedule1.customerId,
        productId,
      },
      {
        ...newProduct,
        scheduleId: newSchedule1._id,
        locations: [
          {
            location: locationRemoveId,
            locationType: LocationTypes.ORIGIN,
          },
          {
            location: new mongoose.Types.ObjectId(),
            locationType: LocationTypes.ORIGIN,
          },
        ],
      }
    );

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule1.customerId,
        productId: 22,
      },
      {
        ...newProduct,
        scheduleId: newSchedule1._id,
        locations: [
          {
            location: locationRemoveId,
            locationType: LocationTypes.ORIGIN,
          },
          {
            location: new mongoose.Types.ObjectId().toString(),
            locationType: LocationTypes.DESTINATION,
          },
        ],
      }
    );

    const newSchedule2 = await CustomerScheduleServiceCreate({
      name: "test2",
      customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
        productId: 232,
      },
      {
        ...newProduct,
        scheduleId: newSchedule2._id,
        locations: [
          {
            location: locationRemoveId,
            locationType: LocationTypes.ORIGIN,
          },
        ],
      }
    );

    let getSchedule1 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule1.id,
    });

    getSchedule1.products.forEach((product) => {
      const locationIds = product.locations.map((location) =>
        location.location.toString()
      );
      expect(locationIds).toContain(locationRemoveId);
    });

    let getSchedule2 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule2.id,
    });

    getSchedule2.products.forEach((product) => {
      const locationIds = product.locations.map((location) =>
        location.location.toString()
      );
      expect(locationIds).toContain(locationRemoveId);
    });

    expect(getSchedule1.products[0].locations).toHaveLength(2);
    expect(getSchedule1.products[1].locations).toHaveLength(2);
    expect(getSchedule2.products[0].locations).toHaveLength(1);

    await CustomerProductServiceRemoveLocationFromAll({
      locationId: locationRemoveId,
      customerId,
    });

    getSchedule1 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule1.id,
    });

    getSchedule2 = await CustomerScheduleServiceGet({
      customerId,
      scheduleId: newSchedule2.id,
    });

    expect(getSchedule1.products[0].locations).toHaveLength(1);
    expect(getSchedule1.products[1].locations).toHaveLength(1);
    expect(getSchedule2.products[0].locations).toHaveLength(0);

    getSchedule1.products.forEach((product) => {
      const locationIds = product.locations.map((location) =>
        location.location.toString()
      );
      expect(locationIds).not.toContain(locationRemoveId);
    });
  });
});
