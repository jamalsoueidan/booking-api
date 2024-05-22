import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { CustomerProductsServiceList } from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsServiceList", () => {
  const customerId = 123;

  it("should get all products for all schedules", async () => {
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

    await createScheduleWithProducts({
      name: "ab",
      customerId,
      products: [
        { ...product1, productId: 1001 },
        { ...product1, productId: 1000 },
      ],
    });

    await createScheduleWithProducts({
      name: "ab2",
      customerId,
      products: [
        { ...product1, productId: 1003 },
        { ...product1, productId: 1004 },
      ],
    });

    const products = await CustomerProductsServiceList({ customerId });
    expect(products).toHaveLength(4);
  });
});
