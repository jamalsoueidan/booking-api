import { NotFoundError } from "~/library/handler";
import { arrayElements, createUser } from "~/library/jest/helpers";
import { createSchedule } from "~/library/jest/helpers/schedule";
import {
  CustomerScheduleServiceCreate,
  CustomerScheduleServiceDestroy,
  CustomerScheduleServiceGet,
  CustomerScheduleServiceGetWithCustomer,
  CustomerScheduleServiceList,
  CustomerScheduleServiceUpdate,
} from "./schedule";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleService", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should create a new schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    expect(newSchedule.name).toEqual(name);
    expect(newSchedule.customerId).toEqual(customerId);
  });

  it("should delete an existing schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    const deleteResult = await CustomerScheduleServiceDestroy({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(deleteResult.deletedCount).toEqual(1);
  });

  it("should update schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    const updatedScheduleName = "Updated Test Schedule";

    const updatedSchedule = await CustomerScheduleServiceUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
      },
      {
        name: updatedScheduleName,
      }
    );
    expect(updatedSchedule).toMatchObject({
      name: updatedScheduleName,
    });
  });

  it("should throw NotFoundError when trying to update schedule that is not found", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    const updatedScheduleName = "Updated Test Schedule";

    await expect(
      CustomerScheduleServiceUpdate(
        { scheduleId: newSchedule._id, customerId: 0 },
        {
          name: updatedScheduleName,
        }
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("should return all schedules for a customerId", async () => {
    await CustomerScheduleServiceCreate({ name, customerId });
    await CustomerScheduleServiceCreate({ name: "asd", customerId: 123 });

    const schedules = await CustomerScheduleServiceList({ customerId });

    expect(schedules.length).toEqual(2);
  });

  it("should return a specific schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    const retrievedSchedule = await CustomerScheduleServiceGet({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(retrievedSchedule._id.toString()).toEqual(
      newSchedule._id.toString()
    );
  });

  it("should throw NotFoundError when trying to get schedule that is not found", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });
    await expect(
      CustomerScheduleServiceGet({ scheduleId: newSchedule._id, customerId: 0 })
    ).rejects.toThrow(NotFoundError);
  });

  it("should return schedule with customer", async () => {
    await createUser({ customerId });

    // test with one known productId and one unknown
    const schedule1 = await createSchedule(
      {
        customerId,
      },
      {
        totalProducts: 3,
        days: ["monday", "tuesday"],
        locations: [],
      }
    );

    let productIds = arrayElements(
      schedule1.products.map((p) => p.productId),
      1
    );

    await expect(
      CustomerScheduleServiceGetWithCustomer({
        customerId,
        productIds: [...productIds, 1],
      })
    ).rejects.toThrow(NotFoundError);

    // test with real productIds
    const schedule2 = await createSchedule(
      {
        customerId,
      },
      {
        totalProducts: 3,
        days: ["wednesday", "thursday"],
        locations: [],
      }
    );

    productIds = arrayElements(
      schedule2.products.map((p) => p.productId),
      2
    );

    const schedule = await CustomerScheduleServiceGetWithCustomer({
      customerId,
      productIds,
    });

    schedule.products.forEach((product) => {
      expect(productIds).toContain(product.productId);
    });
  });
});
