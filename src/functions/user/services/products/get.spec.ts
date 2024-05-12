import { TimeUnit } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { UserProductServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsService", () => {
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
  });

  it("should find a product", async () => {
    const user = await createUser({ customerId: 134 });

    const product = {
      ...newProduct,
      productId,
    };

    const newSchedule = await createSchedule({
      name,
      customerId: user.customerId,
      products: [product],
    });

    const foundProduct = await UserProductServiceGet({
      username: user.username || "",
      productHandle: newProduct.productHandle,
    });

    expect(foundProduct).toMatchObject({ productId });
  });
});
