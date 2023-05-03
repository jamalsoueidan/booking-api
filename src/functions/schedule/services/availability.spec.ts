import { BookingModel } from "~/functions/booking";
import { ScheduleModel } from "~/functions/schedule/schedule.model";
import { getAvailability } from "./availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("getAvailability", () => {
  const scheduleData = {
    name: "Test Schedule",
    customerId: 1,
    slots: [
      {
        day: "monday",
        intervals: [
          {
            from: "08:00",
            to: "12:00",
          },
          {
            from: "14:00",
            to: "18:00",
          },
        ],
      },
    ],
    products: [
      {
        productId: 99,
        visible: true,
      },
    ],
  };

  it("should return available slots for the given date range and product", async () => {
    await ScheduleModel.create(scheduleData);
    const startDate = new Date("2023-05-01T00:00:00Z");
    const endDate = new Date("2023-05-31T00:00:00Z");
    const customerId = 1;
    const productId = 99;

    const result = await getAvailability(
      customerId,
      productId,
      startDate,
      endDate
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);

    result.forEach((entry) => {
      expect(entry).toHaveProperty("date");
      expect(entry).toHaveProperty("slots");
      expect(Array.isArray(entry.slots)).toBeTruthy();
    });
  });

  it("should exclude booked slots", async () => {
    await ScheduleModel.create(scheduleData);
    const startDate = new Date("2023-05-01T00:00:00Z");
    const endDate = new Date("2023-05-31T00:00:00Z");
    const customerId = 1;
    const productId = 99;

    // Insert bookings into the database
    const bookings = [
      {
        customerId,
        productId,
        start: new Date("2023-05-01T08:00:00Z"),
        end: new Date("2023-05-01T09:00:00Z"),
      },
      {
        customerId,
        productId,
        start: new Date("2023-05-01T14:00:00Z"),
        end: new Date("2023-05-01T15:00:00Z"),
      },
    ];

    for (const booking of bookings) {
      const newBooking = new BookingModel(booking);
      await newBooking.save();
    }

    // Fetch available slots and filter out the booked slots
    const result = await getAvailability(
      customerId,
      productId,
      startDate,
      endDate
    );

    const day = result.find(
      (entry) => entry.date === "2023-05-01T00:00:00.000Z"
    );

    if (day) {
      expect(day.slots).not.toContain("2023-05-01T08:00:00.000Z");
      expect(day.slots).not.toContain("2023-05-01T14:00:00.000Z");
    }
  });

  it("should exclude blocked slots", async () => {
    await ScheduleModel.create({
      ...scheduleData,
      blockDates: [
        {
          start: new Date("2023-05-01T09:00:00Z"),
          end: new Date("2023-05-01T10:00:00Z"),
        },
      ],
    });
    const startDate = new Date("2023-05-01T00:00:00Z");
    const endDate = new Date("2023-05-31T00:00:00Z");
    const customerId = 1;
    const productId = 99;

    // Fetch available slots and filter out the blocked slots
    const result = await getAvailability(
      customerId,
      productId,
      startDate,
      endDate
    );

    const day = result.find(
      (entry) => entry.date === "2023-05-01T00:00:00.000Z"
    );

    if (day) {
      expect(day.slots).not.toContain("2023-05-01T09:00:00.000Z");
      expect(day.slots).not.toContain("2023-05-01T09:20:00.000Z");
      expect(day.slots).not.toContain("2023-05-01T09:40:00.000Z");
    }
  });
});
