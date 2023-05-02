import { NotFoundError } from "~/library/handler";
import {
  ScheduleServiceCreate,
  ScheduleServiceDestroy,
  ScheduleServiceGet,
  ScheduleServiceList,
  ScheduleServiceUpdate,
} from "./schedule.service";
import { Schedule } from "./schedule.types";

require("~/library/jest/mongoose/mongodb.jest");

describe("Schedule Service", () => {
  const customerId = 123;
  const name = "Test Schedule";

  test("createSchedule should create a new schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    expect(newSchedule.name).toEqual(name);
    expect(newSchedule.customerId).toEqual(customerId);
  });

  test("deleteSchedule should delete an existing schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const deleteResult = await ScheduleServiceDestroy(newSchedule);

    expect(deleteResult.deletedCount).toEqual(1);
  });

  test("updateSchedule should update an existing schedule with full object", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });

    const updatedScheduleData: Omit<Schedule, "_id" | "customerId"> = {
      name: "Updated Test Schedule",
      slots: [
        {
          day: "monday",
          intervals: [
            {
              from: "09:00",
              to: "12:00",
            },
            {
              from: "13:00",
              to: "17:00",
            },
          ],
        },
        {
          day: "tuesday",
          intervals: [
            {
              from: "10:00",
              to: "12:00",
            },
            {
              from: "14:00",
              to: "18:00",
            },
          ],
        },
      ],
    };

    const updatedSchedule = await ScheduleServiceUpdate(
      { _id: newSchedule._id, customerId: newSchedule.customerId },
      updatedScheduleData
    );

    expect(updatedSchedule).not.toBeNull();
    expect(updatedSchedule!.name).toEqual(updatedScheduleData.name);
    expect(updatedSchedule!.slots.length).toEqual(
      (updatedScheduleData.slots as Schedule["slots"]).length
    );
    expect(updatedSchedule!.slots[0].day).toEqual(
      (updatedScheduleData.slots as Schedule["slots"])[0].day
    );
    expect(updatedSchedule!.slots[0].intervals).toMatchObject(
      (updatedScheduleData.slots as Schedule["slots"])[0].intervals
    );
    expect(updatedSchedule!.slots[1].day).toEqual(
      (updatedScheduleData.slots as Schedule["slots"])[1].day
    );
    expect(updatedSchedule!.slots[1].intervals).toMatchObject(
      (updatedScheduleData.slots as Schedule["slots"])[1].intervals
    );
  });

  test("updateSchedule should throw NotFoundError when schedule is not found", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const updatedScheduleName = "Updated Test Schedule";

    await expect(
      ScheduleServiceUpdate(
        { _id: newSchedule._id, customerId: 0 },
        {
          name: updatedScheduleName,
        }
      )
    ).rejects.toThrow(NotFoundError);
  });

  test("getAllSchedules should return all schedules for a customerId", async () => {
    await ScheduleServiceCreate({ name, customerId });
    await ScheduleServiceCreate({ name: "Test Schedule 2", customerId });

    const schedules = await ScheduleServiceList({ customerId });

    expect(schedules.length).toEqual(2);
  });

  test("getById should return a specific schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    const retrievedSchedule = await ScheduleServiceGet(newSchedule);

    expect(retrievedSchedule._id.toString()).toEqual(
      newSchedule._id.toString()
    );
  });

  test("getById should throw NotFoundError when schedule is not found", async () => {
    const newSchedule = await ScheduleServiceCreate({ name, customerId });
    await expect(
      ScheduleServiceGet({ _id: newSchedule._id, customerId: 0 })
    ).rejects.toThrow(NotFoundError);
  });
});
