import { ScheduleServiceCreate, TimeUnit } from "~/functions/schedule";
import {
  CustomerProductServiceDestroy,
  CustomerProductServiceGet,
  CustomerProductServiceUpsert,
  CustomerProductServiceUpsertBody,
  CustomerProductsServiceList,
  CustomerProductsServiceListIds,
} from "./product";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsService", () => {
  const customerId = 123;
  const name = "Test Schedule";
  const productId = 1000;
  const newProduct: CustomerProductServiceUpsertBody = {
    variantId: 1,
    scheduleId: "",
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
  };

  it("should get all productIds for all schedules", async () => {
    const schedule1 = await ScheduleServiceCreate({
      name: "ab",
      customerId: 7,
    });

    const product1: CustomerProductServiceUpsertBody = {
      variantId: 1,
      scheduleId: schedule1._id,
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
    };

    await CustomerProductServiceUpsert(
      {
        customerId: schedule1.customerId,
        productId: 999,
      },
      product1
    );

    const schedule2 = await ScheduleServiceCreate({ name: "ab", customerId });

    const product2 = { ...product1, scheduleId: schedule2._id };

    await CustomerProductServiceUpsert(
      {
        customerId: schedule2.customerId,
        productId: 1001,
      },
      product2
    );

    await CustomerProductServiceUpsert(
      {
        customerId: schedule2.customerId,
        productId: 1000,
      },
      product2
    );

    const schedule3 = await ScheduleServiceCreate({
      name: "test",
      customerId,
    });

    const product3 = {
      ...product1,
      scheduleId: schedule3._id,
    };

    await CustomerProductServiceUpsert(
      {
        customerId: schedule3.customerId,
        productId: 1002,
      },
      product3
    );

    await CustomerProductServiceUpsert(
      {
        customerId: schedule3.customerId,
        productId: 1004,
      },
      product3
    );

    const products = await CustomerProductsServiceListIds({ customerId });
    expect(products).toEqual([1001, 1000, 1002, 1004]);
  });

  it("should get all products for all schedules", async () => {
    const schedule1 = await ScheduleServiceCreate({ name: "ab", customerId });

    const product1: CustomerProductServiceUpsertBody = {
      variantId: 1,
      scheduleId: schedule1._id,
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
    };

    await CustomerProductServiceUpsert(
      {
        customerId: schedule1.customerId,
        productId: 1001,
      },
      product1
    );

    await CustomerProductServiceUpsert(
      {
        customerId: schedule1.customerId,
        productId: 1000,
      },
      product1
    );

    const newSchedule2 = await ScheduleServiceCreate({
      name: "test",
      customerId,
    });

    const product2 = { ...product1, scheduleId: newSchedule2._id };

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule2.customerId,
        productId: 1002,
      },
      product2
    );

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule2.customerId,
        productId: 1004,
      },
      product2
    );

    const products = await CustomerProductsServiceList({ customerId });
    expect(products).toHaveLength(4);
  });

  it("should add a new product to the schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    const updateProduct = await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    expect(updateProduct).toMatchObject({
      productId,
      ...newProduct,
      scheduleId: newSchedule._id,
    });
  });

  it("should find a product", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    const updatedSchedule = await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    const foundProduct = await CustomerProductServiceGet({
      customerId: newSchedule.customerId,
      productId,
    });

    expect(foundProduct).toMatchObject({ productId });
  });

  it("should update an existing product in the schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    const updatedProduct = {
      ...newProduct,
      duration: 90,
      scheduleId: newSchedule._id,
    };

    const updateProduct = await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      updatedProduct
    );

    expect(updateProduct).toMatchObject({ productId, ...updatedProduct });
  });

  it("should remove an existing product from the schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    const updatedSchedule = await CustomerProductServiceDestroy({
      customerId: newSchedule.customerId,
      productId,
    });

    expect(updatedSchedule?.modifiedCount).toBe(1);
  });
});
