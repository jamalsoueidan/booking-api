import { TimeUnit } from "~/functions/schedule";
import { omitObjectIdProps } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerProductServiceAdd } from "./add";
import { CustomerProductServiceGet } from "./get";
import { CustomerProductServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceUpdate", () => {
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
  });

  it("should update an existing product in the schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      { ...newProduct, productId, scheduleId: newSchedule._id }
    );

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
