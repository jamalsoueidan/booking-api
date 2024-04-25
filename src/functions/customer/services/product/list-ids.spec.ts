import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerProductServiceAdd } from "./add";
import { CustomerProductsServiceListIds } from "./list-ids";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsServiceListIds", () => {
  const customerId = 123;

  it("should get all productIds for all schedules", async () => {
    const schedule1 = await CustomerScheduleServiceCreate({
      name: "ab",
      customerId: 7,
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
    });

    await CustomerProductServiceAdd(
      {
        customerId: schedule1.customerId,
      },
      { ...product1, productId: 999, scheduleId: schedule1._id }
    );

    const schedule2 = await CustomerScheduleServiceCreate({
      name: "ab",
      customerId,
    });

    const product2 = { ...product1, scheduleId: schedule2._id };

    await CustomerProductServiceAdd(
      {
        customerId: schedule2.customerId,
      },
      { ...product2, productId: 1001 }
    );

    await CustomerProductServiceAdd(
      {
        customerId: schedule2.customerId,
      },
      { ...product2, productId: 1000 }
    );

    const schedule3 = await CustomerScheduleServiceCreate({
      name: "test",
      customerId,
    });

    const product3 = {
      ...product1,
      scheduleId: schedule3._id,
    };

    await CustomerProductServiceAdd(
      {
        customerId: schedule3.customerId,
      },
      { ...product3, productId: 1002 }
    );

    await CustomerProductServiceAdd(
      {
        customerId: schedule3.customerId,
      },
      { ...product3, productId: 1004 }
    );

    const products = await CustomerProductsServiceListIds({ customerId });
    expect(products).toEqual([1001, 1000, 1002, 1004]);
  });
});
