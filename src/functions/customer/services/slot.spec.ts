import { ScheduleModel, SlotWeekDays } from "~/functions/schedule";
import {
  CustomerScheduleSlotServiceUpdate,
  CustomerScheduleSlotServiceUpdateBody,
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

describe("CustomerScheduleSlotService", () => {
  it("should update a slots", async () => {
    const schedule = await createTestSchedule(2);

    const newSlot: CustomerScheduleSlotServiceUpdateBody = [
      {
        day: SlotWeekDays.TUESDAY,
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
    ];

    const newSchedule = await CustomerScheduleSlotServiceUpdate(
      {
        scheduleId: schedule._id,
        customerId: schedule.customerId,
      },
      newSlot
    );

    expect(newSchedule?.slots.length).toBe(1);
    expect(newSchedule?.slots[0].day).toEqual(newSlot[0].day);

    const updatedSlot: CustomerScheduleSlotServiceUpdateBody = [
      ...newSlot,
      {
        day: SlotWeekDays.WEDNESDAY,
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
    ];

    const updatedSchedule = await CustomerScheduleSlotServiceUpdate(
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

    const invalidSlot: CustomerScheduleSlotServiceUpdateBody = [
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
      CustomerScheduleSlotServiceUpdate(
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

    const duplicateDaySlot: CustomerScheduleSlotServiceUpdateBody = [
      {
        day: SlotWeekDays.MONDAY,
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
      {
        day: SlotWeekDays.MONDAY,
        intervals: [
          {
            from: "14:00",
            to: "16:00",
          },
        ],
      },
    ];

    await expect(
      CustomerScheduleSlotServiceUpdate(
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

    const overlappingIntervalsSlot: CustomerScheduleSlotServiceUpdateBody = [
      {
        day: SlotWeekDays.THURSDAY,
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
      CustomerScheduleSlotServiceUpdate(
        {
          scheduleId: schedule._id,
          customerId: schedule.customerId,
        },
        overlappingIntervalsSlot
      )
    ).rejects.toThrowError();
  });
});
