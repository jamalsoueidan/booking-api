import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerProductServiceDestroy } from "./destroy";
import { CustomerProductServiceUpsert } from "./upsert";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceDestroy", () => {
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

  it("should remove an existing product from the schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    const updatedSchedule = await CustomerProductServiceDestroy({
      customerId: newSchedule.customerId,
      productId,
    });

    expect(updatedSchedule?.modifiedCount).toBe(1);
  });
});
