import { ScheduleModel } from "../schedule.model";
import {
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
  it("should update a slots", async () => {
    const schedule = await createTestSchedule(2);

    const newSlot: ScheduleServiceUpdateSlotBody = [
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

    const newSchedule = await ScheduleServiceUpdateSlot(
      {
        scheduleId: schedule._id,
        customerId: schedule.customerId,
      },
      newSlot
    );

    expect(newSchedule?.slots.length).toBe(1);
    expect(newSchedule?.slots[0].day).toEqual(newSlot[0].day);

    const updatedSlot: ScheduleServiceUpdateSlotBody = [
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

    const updatedSchedule = await ScheduleServiceUpdateSlot(
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
});
