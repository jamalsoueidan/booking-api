import { NotFoundError } from "~/library/handler";
import { TimeUnit } from "../schedule.types";
import {
  ScheduleServiceCreate,
  ScheduleServiceDestroy,
  ScheduleServiceGet,
  ScheduleServiceList,
  ScheduleServiceUpdate,
} from "./schedule";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleService", () => {
  const customerId = 123;
  const name = "Test Schedule";

  it("should create a new schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    expect(newSchedule.name).toEqual(name);
    expect(newSchedule.customerId).toEqual(customerId);
  });

  it("should delete an existing schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const deleteResult = await ScheduleServiceDestroy({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(deleteResult.deletedCount).toEqual(1);
  });

  it("should update schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const updatedScheduleName = "Updated Test Schedule";

    const updatedSchedule = await ScheduleServiceUpdate(
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
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const updatedScheduleName = "Updated Test Schedule";

    await expect(
      ScheduleServiceUpdate(
        { scheduleId: newSchedule._id, customerId: 0 },
        {
          name: updatedScheduleName,
        }
      )
    ).rejects.toThrow(NotFoundError);
  });

  it("should return all schedules for a customerId", async () => {
    await ScheduleServiceCreate({ name, customerId });
    await ScheduleServiceCreate({ name: "asd", customerId: 123 });

    const schedules = await ScheduleServiceList({ customerId });

    expect(schedules.length).toEqual(2);
  });

  it("should return all schedules with producsts that exists for a customerId", async () => {
    await ScheduleServiceCreate({
      name,
      customerId,
      products: [
        {
          productId: 1,
          variantId: 1,
          duration: 1,
          breakTime: 1,
          bookingPeriod: {
            unit: TimeUnit.WEEKS,
            value: 1,
          },
          noticePeriod: {
            unit: TimeUnit.DAYS,
            value: 1,
          },
          description: "asd",
          locations: [],
        },
      ],
    });
    await ScheduleServiceCreate({ name: "asd", customerId: 123 });

    const schedules = await ScheduleServiceList({
      customerId,
      productsExist: true,
    });

    expect(schedules.length).toEqual(1);
  });

  it("should return a specific schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const retrievedSchedule = await ScheduleServiceGet({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(retrievedSchedule._id.toString()).toEqual(
      newSchedule._id.toString()
    );
  });

  it("should throw NotFoundError when trying to get schedule that is not found", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    await expect(
      ScheduleServiceGet({ scheduleId: newSchedule._id, customerId: 0 })
    ).rejects.toThrow(NotFoundError);
  });
});
