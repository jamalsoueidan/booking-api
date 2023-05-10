import { ScheduleProduct, TimeUnit } from "../schedule.types";
import {
  ScheduleProductServiceCreateOrUpdate,
  ScheduleProductServiceDestroy,
  ScheduleProductServiceGet,
} from "./product";
import { ScheduleServiceCreate } from "./schedule";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleProductService", () => {
  const customerId = 123;
  const name = "Test Schedule";
  const productId = 1000;
  const newProduct: Omit<ScheduleProduct, "productId"> = {
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

  it("createOrUpdateProduct should add a new product to the schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    const updatedSchedule = await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId,
      },
      newProduct
    );

    const foundProduct = updatedSchedule?.products.find(
      (p) => p.productId === productId
    );

    expect(JSON.stringify(foundProduct)).toEqual(
      JSON.stringify({ productId, ...newProduct })
    );
  });

  it("createOrUpdateProduct should find a product", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    const updatedSchedule = await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId,
      },
      newProduct
    );

    const foundProduct = await ScheduleProductServiceGet({
      customerId: newSchedule.customerId,
      productId,
    });

    expect(foundProduct).toMatchObject({ productId });
  });

  it("createOrUpdateProduct should update an existing product in the schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId,
      },
      newProduct
    );

    const updatedProduct = { ...newProduct, duration: 90 };
    const updatedSchedule = await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId,
      },
      updatedProduct
    );

    const foundProduct = updatedSchedule?.products.find(
      (p) => p.productId === productId
    );

    expect(JSON.stringify(foundProduct)).toEqual(
      JSON.stringify({ productId, ...updatedProduct })
    );
  });

  it("removeProduct should remove an existing product from the schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId,
      },
      newProduct
    );

    const updatedSchedule = await ScheduleProductServiceDestroy({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
      productId,
    });

    const foundProduct = updatedSchedule?.products.find(
      (p) => p.productId === productId
    );

    expect(foundProduct).toBe(undefined);
  });

  it("createOrUpdateProduct should enforce productId uniqueness across schedules within the same customerId", async () => {
    const newSchedule1 = await ScheduleServiceCreate({
      name: "Test Schedule 1",
      customerId,
    });
    const newSchedule2 = await ScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
    });

    // Add the same product to the first schedule
    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule1._id,
        customerId: newSchedule1.customerId,
        productId,
      },
      newProduct
    );

    // Attempt to add the same product to the second schedule and expect an error
    await expect(
      ScheduleProductServiceCreateOrUpdate(
        {
          scheduleId: newSchedule2._id,
          customerId: newSchedule2.customerId,
          productId,
        },
        newProduct
      )
    ).rejects.toThrowError();
  });
});
