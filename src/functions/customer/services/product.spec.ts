import {
  ScheduleProduct,
  ScheduleServiceCreate,
  TimeUnit,
} from "~/functions/schedule";
import { ScheduleProductServiceCreateOrUpdate } from "~/functions/schedule/services/product";
import {
  CustomerProductsServiceList,
  CustomerProductsServiceListIds,
} from "./product";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsService", () => {
  const customerId = 123;

  it("should get all productIds in all schedules", async () => {
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

    const anotherCustomerSchedule = await ScheduleServiceCreate({
      name: "ab",
      customerId: 7,
    });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: anotherCustomerSchedule._id,
        customerId: anotherCustomerSchedule.customerId,
        productId: 999,
      },
      newProduct
    );

    const newSchedule = await ScheduleServiceCreate({ name: "ab", customerId });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId: 1001,
      },
      newProduct
    );

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId: 1000,
      },
      newProduct
    );

    const newSchedule2 = await ScheduleServiceCreate({
      name: "test",
      customerId,
    });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule2._id,
        customerId: newSchedule2.customerId,
        productId: 1002,
      },
      newProduct
    );

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule2._id,
        customerId: newSchedule2.customerId,
        productId: 1004,
      },
      newProduct
    );

    const products = await CustomerProductsServiceListIds({ customerId });
    expect(products).toEqual([1001, 1000, 1002, 1004]);
  });

  it("should get all products from all schedules", async () => {
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

    const newSchedule = await ScheduleServiceCreate({ name: "ab", customerId });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId: 1001,
      },
      newProduct
    );

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId: 1000,
      },
      newProduct
    );

    const newSchedule2 = await ScheduleServiceCreate({
      name: "test",
      customerId,
    });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule2._id,
        customerId: newSchedule2.customerId,
        productId: 1002,
      },
      newProduct
    );

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule2._id,
        customerId: newSchedule2.customerId,
        productId: 1004,
      },
      newProduct
    );

    const products = await CustomerProductsServiceList({ customerId });
    expect(products).toHaveLength(4);
  });
});
