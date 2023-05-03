import { ScheduleModel } from "../schedule.model";
import {
  ScheduleServiceAddSlot,
  ScheduleServiceAddSlotBody,
  ScheduleServiceUpdateSlot,
  ScheduleServiceUpdateSlotBody,
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

describe("ScheduleServiceSlot", () => {
  test("should add a slot", async () => {
    const schedule = await createTestSchedule(1);

    const newSlot: ScheduleServiceAddSlotBody = {
      day: "friday",
      intervals: [
        {
          from: "09:00",
          to: "12:00",
        },
      ],
    };

    const updatedSchedule = await ScheduleServiceAddSlot(
      {
        scheduleId: schedule._id,
        customerId: schedule.customerId,
      },
      newSlot
    );

    expect(updatedSchedule?.slots.length).toBe(1);
    expect(updatedSchedule?.slots[0].day).toEqual(newSlot.day);
    expect(updatedSchedule?.slots[0].intervals).toEqual(newSlot.intervals);
  });

  test("should update a slot", async () => {
    const schedule = await createTestSchedule(2);

    const newSlot: ScheduleServiceAddSlotBody = {
      day: "tuesday",
      intervals: [
        {
          from: "14:00",
          to: "17:00",
        },
      ],
    };

    const addedSchedule = await ScheduleServiceAddSlot(
      {
        scheduleId: schedule._id,
        customerId: schedule.customerId,
      },
      newSlot
    );

    const updatedSlot: ScheduleServiceUpdateSlotBody = {
      _id: addedSchedule?.slots[0]._id || "",
      day: "wednesday",
      intervals: [
        {
          from: "10:00",
          to: "13:00",
        },
      ],
    };

    const updatedSchedule = await ScheduleServiceUpdateSlot(
      {
        scheduleId: schedule._id,
        customerId: schedule.customerId,
        slotId: addedSchedule?.slots[0]._id || "",
      },
      updatedSlot
    );

    expect(updatedSchedule?.slots.length).toBe(1);
    expect(updatedSchedule?.slots[0].day).toEqual(updatedSlot.day);
    expect(updatedSchedule?.slots[0].intervals).toEqual(updatedSlot.intervals);
  });
});
