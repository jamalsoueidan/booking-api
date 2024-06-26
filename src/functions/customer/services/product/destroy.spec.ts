import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { CustomerProductServiceDestroy } from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceDestroy", () => {
  const customerId = 123;
  const name = "Test Schedule";
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
  });

  it("should remove an existing product from the schedule", async () => {
    const newSchedule = await createScheduleWithProducts({
      name,
      customerId,
      products: [newProduct],
    });

    const updatedSchedule = await CustomerProductServiceDestroy({
      customerId: newSchedule.customerId,
      productId: newProduct.productId,
    });

    expect(updatedSchedule?.modifiedCount).toBe(1);
  });
});
