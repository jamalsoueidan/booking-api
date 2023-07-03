import { format, utcToZonedTime } from "date-fns-tz";
import { UserModel } from "~/functions/user/user.model";
import { getProductObject } from "../jest/helpers/product";
import {
  GenerateAvailabilityProps,
  generateAvailability,
} from "./generate-availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("generateAvailability", () => {
  const customerId = 1;
  const schedule: GenerateAvailabilityProps["schedule"] = {
    customerId: 1,
    slots: [
      {
        day: "thursday",
        intervals: [
          {
            from: "08:00",
            to: "16:00",
          },
        ],
      },
    ],
    products: [getProductObject()],
  };

  beforeEach(async () => {
    const user = await UserModel.create({
      customerId,
      fullname: "jamal soueidan",
    });
  });

  it("should generate an array of objects each representing a day", async () => {
    const startDate = new Date().toISOString();
    const availability = await generateAvailability({ schedule, startDate });
    expect(Array.isArray(availability)).toBe(true);
    availability.forEach((day) => {
      expect(day).toHaveProperty("date");
      expect(day).toHaveProperty("slots");
    });
  });

  it("should not generate availability for the days not defined in the schedule", async () => {
    const startDate = new Date().toISOString();
    const availability = await generateAvailability({ schedule, startDate });
    availability.forEach((day) => {
      const dayOfWeek = format(
        utcToZonedTime(new Date(day.date), "Etc/UTC"),
        "iiii"
      );
      const daySchedule = schedule.slots.find(
        (slot) => slot.day.toLowerCase() === dayOfWeek.toLowerCase()
      );
      expect(daySchedule).toBeDefined();
    });
  });

  it("should generate slots for each day based on the intervals defined in the schedule", async () => {
    const startDate = new Date().toISOString();
    const availability = await generateAvailability({ schedule, startDate });
    availability.forEach((day) => {
      const dayOfWeek = format(
        utcToZonedTime(new Date(day.date), "Etc/UTC"),
        "iiii"
      );
      const daySchedule = schedule.slots.find(
        (slot) => slot.day.toLowerCase() === dayOfWeek.toLowerCase()
      );

      // Assuming that each daySchedule has an 'intervals' property that is an array of intervals
      daySchedule?.intervals.forEach((interval) => {
        expect(day.slots.length).toBeGreaterThan(0);
        day.slots.forEach((slot) => {
          expect(timeToMinutes(new Date(slot.from))).toBeGreaterThanOrEqual(
            timeToMinutes(timeToDate(interval.from, new Date(day.date)))
          );
          expect(timeToMinutes(new Date(slot.to))).toBeLessThanOrEqual(
            timeToMinutes(timeToDate(interval.to, new Date(day.date)))
          );
        });
      });
    });
  });

  // Helper function to convert a Date object to minutes
  function timeToMinutes(date: Date) {
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }

  // Helper function to convert time string to Date object
  function timeToDate(time: string, date: Date): Date {
    const [hour, minute] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setUTCHours(hour, minute, 0, 0);
    return newDate;
  }
});
