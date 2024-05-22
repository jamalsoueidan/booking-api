import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { CustomerProductServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsService", () => {
  const customerId = 123;
  const name = "Test Schedule";
  const productId = 1000;
  const newProduct = getProductObject({
    productId,
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

  it("should find a product", async () => {
    const newSchedule = await createScheduleWithProducts({
      name,
      customerId,
      products: [newProduct],
    });

    const foundProduct = await CustomerProductServiceGet({
      customerId: newSchedule.customerId,
      productId,
    });

    expect(foundProduct).toMatchObject({ productId });
  });
});
