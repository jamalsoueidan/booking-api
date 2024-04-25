import { CustomerProductServiceAdd } from "~/functions/customer/services/product/add";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";
import { TimeUnit } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
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

    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId: user.customerId,
    });

    const updatedSchedule = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      { ...newProduct, productId, scheduleId: newSchedule._id }
    );

    const foundProduct = await UserProductServiceGet({
      username: user.username || "",
      productHandle: newProduct.productHandle,
    });

    expect(foundProduct).toMatchObject({ productId });
  });
});
