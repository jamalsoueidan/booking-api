import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { CustomerProductsServiceListIds } from "./list-ids";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsServiceListIds", () => {
  const customerId = 123;

  it("should get all productIds for all schedules", async () => {
    const product1 = getProductObject({
      productId: 999,
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

    await createScheduleWithProducts({
      name: "ANOTHER CUSTOMER",
      customerId: 7,
      products: [product1],
    });

    await createScheduleWithProducts({
      name: "SAME CUSTOMER",
      customerId,
      products: [
        { ...product1, productId: 1001 },
        { ...product1, productId: 1002 },
      ],
    });

    await createScheduleWithProducts({
      name: "SAME CUSTOMER2",
      customerId,
      products: [
        { ...product1, productId: 1003 },
        { ...product1, productId: 1004 },
      ],
    });

    const products = await CustomerProductsServiceListIds({ customerId });

    expect(products).toEqual([1001, 1002, 1003, 1004]);
  });
});
