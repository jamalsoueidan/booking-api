import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerProductServiceAdd } from "./add";
import { CustomerProductsServiceList } from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsServiceList", () => {
  const customerId = 123;

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

    await CustomerProductServiceAdd(
      {
        customerId: schedule1.customerId,
      },
      { ...product1, productId: 1001, scheduleId: schedule1._id }
    );

    await CustomerProductServiceAdd(
      {
        customerId: schedule1.customerId,
      },
      { ...product1, productId: 1000, scheduleId: schedule1._id }
    );

    const newSchedule2 = await CustomerScheduleServiceCreate({
      name: "test",
      customerId,
    });

    const product2 = { ...product1, scheduleId: newSchedule2._id };

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
      },
      { ...product2, productId: 1002 }
    );

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule2.customerId,
      },
      { ...product2, productId: 1004 }
    );

    const products = await CustomerProductsServiceList({ customerId });
    expect(products).toHaveLength(4);
  });
});
