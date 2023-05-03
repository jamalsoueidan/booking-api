import { NotFoundError } from "~/library/handler";
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

  it("createSchedule should create a new schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    expect(newSchedule.name).toEqual(name);
    expect(newSchedule.customerId).toEqual(customerId);
  });

  it("deleteSchedule should delete an existing schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const deleteResult = await ScheduleServiceDestroy({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(deleteResult.deletedCount).toEqual(1);
  });

  it("updateSchedule should update schedule", async () => {
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

  it("updateSchedule should throw NotFoundError when schedule is not found", async () => {
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

  it("getAllSchedules should return all schedules for a customerId", async () => {
    await ScheduleServiceCreate({ name, customerId });
    await ScheduleServiceCreate({ name: "asd", customerId: 123 });

    const schedules = await ScheduleServiceList({ customerId });

    expect(schedules.length).toEqual(2);
  });

  it("getById should return a specific schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const retrievedSchedule = await ScheduleServiceGet({
      scheduleId: newSchedule._id,
      customerId: newSchedule.customerId,
    });

    expect(retrievedSchedule._id.toString()).toEqual(
      newSchedule._id.toString()
    );
  });

  it("getById should throw NotFoundError when schedule is not found", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    await expect(
      ScheduleServiceGet({ scheduleId: newSchedule._id, customerId: 0 })
    ).rejects.toThrow(NotFoundError);
  });
});
