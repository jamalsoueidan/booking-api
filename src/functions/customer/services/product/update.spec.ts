import { TimeUnit } from "~/functions/schedule";
import { omitObjectIdProps } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { CustomerProductServiceGet } from "./get";
import { CustomerProductServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceUpdate", () => {
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

  it("should update an existing product in the schedule", async () => {
    const newSchedule = await createSchedule({
      name,
      customerId,
      products: [newProduct],
    });

    const productBody = {
      duration: 90,
    };

    let updateProduct = await CustomerProductServiceUpdate(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      productBody
    );

    const getUpdatedProduct = await CustomerProductServiceGet({
      customerId: newSchedule.customerId,
      productId,
    });

    expect(omitObjectIdProps(getUpdatedProduct)).toEqual(
      expect.objectContaining(
        omitObjectIdProps({
          ...productBody,
          productId: updateProduct.productId,
        })
      )
    );
  });
});
