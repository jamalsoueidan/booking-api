import { ScheduleModel } from "~/functions/schedule";
import {
  ScheduleSlotServiceUpdate,
  ScheduleSlotServiceUpdateBody,
} from "./slots";

require("~/library/jest/mongoose/mongodb.jest");
// Utility function to create a schedule for testing purposes
async function createTestSchedule(customerId: number) {
  const schedule = new ScheduleModel({
    name: "Test Schedule",
    customerId,
    slots: [],
    products: [],
  });

  return schedule.save();
}

describe("ScheduleSlotService", () => {
  it("should update a slots", async () => {
    const schedule = await createTestSchedule(2);

    const newSlot: ScheduleSlotServiceUpdateBody = [
      {
        day: "tuesday",
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
    ];

    const newSchedule = await ScheduleSlotServiceUpdate(
      {
        scheduleId: schedule._id,
        customerId: schedule.customerId,
      },
      newSlot
    );

    expect(newSchedule?.slots.length).toBe(1);
    expect(newSchedule?.slots[0].day).toEqual(newSlot[0].day);

    const updatedSlot: ScheduleSlotServiceUpdateBody = [
      ...newSlot,
      {
        day: "wednesday",
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
    ];

    const updatedSchedule = await ScheduleSlotServiceUpdate(
      {
        scheduleId: schedule._id,
        customerId: schedule.customerId,
      },
      updatedSlot
    );

    expect(updatedSchedule?.slots.length).toBe(2);
    expect(updatedSchedule?.slots[1].day).toEqual(updatedSlot[1].day);
    expect(updatedSchedule?.slots[1].intervals).toMatchObject(
      updatedSlot[1].intervals
    );
  });

  // ...
  // (keep the existing test case)

  it("should only allow the 7 valid days", async () => {
    const schedule = await createTestSchedule(3);

    const invalidSlot: ScheduleSlotServiceUpdateBody = [
      {
        day: "invalidDay",
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      } as any,
    ];

    await expect(
      ScheduleSlotServiceUpdate(
        {
          scheduleId: schedule._id,
          customerId: schedule.customerId,
        },
        invalidSlot
      )
    ).rejects.toThrowError();
  });

  it("should not allow duplicate days", async () => {
    const schedule = await createTestSchedule(4);

    const duplicateDaySlot: ScheduleSlotServiceUpdateBody = [
      {
        day: "monday",
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
      {
        day: "monday",
        intervals: [
          {
            from: "14:00",
            to: "16:00",
          },
        ],
      },
    ];

    await expect(
      ScheduleSlotServiceUpdate(
        {
          scheduleId: schedule._id,
          customerId: schedule.customerId,
        },
        duplicateDaySlot
      )
    ).rejects.toThrowError();
  });

  it("should not allow overlapping time intervals within a day", async () => {
    const schedule = await createTestSchedule(5);

    const overlappingIntervalsSlot: ScheduleSlotServiceUpdateBody = [
      {
        day: "thursday",
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
          {
            from: "12:00",
            to: "14:00",
          },
        ],
      },
    ];

    await expect(
      ScheduleSlotServiceUpdate(
        {
          scheduleId: schedule._id,
          customerId: schedule.customerId,
        },
        overlappingIntervalsSlot
      )
    ).rejects.toThrowError();
  });
});
