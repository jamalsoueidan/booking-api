import { enUS } from "date-fns/locale";
import { Schedule, TimeUnit } from "~/functions/schedule";
import { generateAvailability } from "./generate-availability";

describe("generateAvailability", () => {
  const schedule: Pick<Schedule, "slots" | "products"> = {
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
    products: [
      {
        productId: 8022088646930,
        variantId: 46727191036231,
        duration: 10,
        breakTime: 5,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
    ],
  };

  it("should generate an array of objects each representing a day", () => {
    const startDate = new Date().toISOString();
    const availability = generateAvailability(schedule, startDate);
    expect(Array.isArray(availability)).toBe(true);
    availability.forEach((day) => {
      expect(day).toHaveProperty("date");
      expect(day).toHaveProperty("slots");
    });
  });

  it("should not generate availability for the days not defined in the schedule", () => {
    const startDate = new Date().toISOString();
    const availability = generateAvailability(schedule, startDate);
    availability.forEach((day) => {
      const dayOfWeek = enUS.localize?.day(new Date(day.date).getDay()) || "";
      const daySchedule = schedule.slots.find(
        (slot) => slot.day.toLowerCase() === dayOfWeek.toLowerCase()
      );
      expect(daySchedule).toBeDefined();
    });
  });

  it("should generate slots for each day based on the intervals defined in the schedule", () => {
    const startDate = new Date().toISOString();
    const availability = generateAvailability(schedule, startDate);
    availability.forEach((day) => {
      const dayOfWeek = enUS.localize?.day(new Date(day.date).getDay()) || "";
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
