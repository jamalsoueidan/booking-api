import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerProductsServiceList } from "./list";
import { CustomerProductServiceUpsert } from "./upsert";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsServiceList", () => {
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

  it("should get all products for all schedules", async () => {
    const schedule1 = await CustomerScheduleServiceCreate({
      name: "ab",
      customerId,
    });

    const product1 = getProductObject({
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

    await CustomerProductServiceUpsert(
      {
        customerId: schedule1.customerId,
        productId: 1001,
      },
      { ...product1, scheduleId: schedule1._id }
    );

    await CustomerProductServiceUpsert(
      {
        customerId: schedule1.customerId,
        productId: 1000,
      },
      { ...product1, scheduleId: schedule1._id }
    );

    const newSchedule2 = await CustomerScheduleServiceCreate({
      name: "test",
      customerId,
    });

    const product2 = { ...product1, scheduleId: newSchedule2._id };

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule2.customerId,
        productId: 1002,
      },
      product2
    );

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule2.customerId,
        productId: 1004,
      },
      product2
    );

    const products = await CustomerProductsServiceList({ customerId });
    expect(products).toHaveLength(4);
  });
});
