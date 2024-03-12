import { TimeUnit } from "~/functions/schedule";
import { omitObjectIdProps } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { CustomerProductServiceUpsert } from "./upsert";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductServiceUpsert", () => {
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

  it("should add a new product to the schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    const updateProduct = await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    expect(updateProduct).toMatchObject({
      ...newProduct,
      productId,
      scheduleId: newSchedule._id.toString(),
    });
  });

  it("should update an existing product in the schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    const productBody = {
      ...newProduct,
      duration: 90,
      scheduleId: newSchedule._id,
    };

    let updateProduct = await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      productBody
    );

    expect(omitObjectIdProps(updateProduct)).toEqual(
      expect.objectContaining(
        omitObjectIdProps({
          ...productBody,
          productId: updateProduct.productId,
        })
      )
    );
  });
});
