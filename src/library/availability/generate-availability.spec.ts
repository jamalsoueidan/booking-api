import { isEqual } from "date-fns";
import { format, utcToZonedTime } from "date-fns-tz";
import { SlotWeekDays } from "~/functions/schedule";
import { UserModel } from "~/functions/user/user.model";
import { getProductObject } from "../jest/helpers/product";
import {
  generateAvailability,
  GenerateAvailabilityProps,
} from "./generate-availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("generateAvailability", () => {
  const customerId = 1;
  const schedule: GenerateAvailabilityProps["schedule"] = {
    _id: "1",
    name: "asd",
    customerId: 1,
    slots: [
      {
        day: SlotWeekDays.THURSDAY,
        intervals: [
          {
            from: "08:00",
            to: "16:00",
          },
        ],
      },
      {
        day: SlotWeekDays.FRIDAY,
        intervals: [
          {
            from: "12:00",
            to: "15:00",
          },
        ],
      },
      {
        day: SlotWeekDays.SATURDAY,
        intervals: [
          {
            from: "12:00",
            to: "15:00",
          },
        ],
      },
      {
        day: SlotWeekDays.SUNDAY,
        intervals: [
          {
            from: "12:00",
            to: "15:00",
          },
        ],
      },
    ],
    products: [
      getProductObject({
        options: [
          {
            productId: 1,
            title: "a",
            required: true,
            variants: [
              {
                variantId: 15,
                title: "a",
                price: 1,
                duration: { value: 30, metafieldId: 1 },
              },
            ],
          },
        ],
      }),
    ],
    customer: {
      fullname: "test",
    },
  };

  beforeAll(() => {
    jest
      .useFakeTimers({
        doNotFake: [
          "nextTick",
          "setImmediate",
          "clearImmediate",
          "setInterval",
          "clearInterval",
          "setTimeout",
          "clearTimeout",
        ],
      })
      .setSystemTime(new Date("2022-02-15"));
  });

  afterAll(() => {
    jest.useRealTimers(); // Go back to real timers
  });

  beforeEach(() =>
    UserModel.create({
      customerId,
      fullname: "jamal soueidan",
      username: "jamal",
    })
  );

  it("should generate an array of objects each representing a day", async () => {
    const startDate = new Date();
    const availability = await generateAvailability({
      schedule,
      fromDate: startDate.toJSON(),
    });
    expect(Array.isArray(availability)).toBe(true);
    availability.forEach((day) => {
      expect(day).toHaveProperty("date");
      expect(day).toHaveProperty("slots");
    });
  });

  it("should generate an array of objects each representing a day", async () => {
    const startDate = new Date();

    let availability = await generateAvailability({
      schedule,
      fromDate: startDate.toJSON(),
    });

    const randomObject = getRandomElement(availability);
    const randomSlot = getRandomElement(randomObject.slots);

    availability = await generateAvailability({
      schedule,
      fromDate: randomSlot.from,
    });

    //expect(availability.length).toBe(1);
    const slot = availability[0].slots.find(
      (slot) =>
        isEqual(slot.from, randomSlot.from) && isEqual(slot.to, randomSlot.to)
    );

    expect(slot).toBeDefined();
  });

  it("should not generate availability for the days not defined in the schedule", async () => {
    const startDate = new Date().toISOString();
    const availability = await generateAvailability({
      schedule,
      fromDate: startDate,
    });
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
    const availability = await generateAvailability({
      schedule,
      fromDate: startDate,
    });
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

function getRandomElement(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}
