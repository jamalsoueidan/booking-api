import { add, isSameDay } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import {
  Schedule,
  ScheduleProductBookingPeriod,
  ScheduleProductNoticePeriod,
  TimeUnit,
} from "~/functions/schedule";
import { generateEndDate, generateStartDate } from "./start-end-date";

describe("generateStartDate", () => {
  it("should return the correct start date when notice period has not passed", () => {
    const startDate = new Date();
    const noticePeriod: ScheduleProductNoticePeriod = {
      unit: TimeUnit.DAYS,
      value: 2,
    };
    const result = generateStartDate(startDate.toISOString(), noticePeriod);
    const expected = add(new Date(), {
      [noticePeriod.unit]: noticePeriod.value,
    });
    expect(isSameDay(result, zonedTimeToUtc(expected, "UTC"))).toBe(true);
  });

  it("should return the start date when notice period has already passed", () => {
    const startDate = add(new Date(), { days: 2 });
    const noticePeriod: ScheduleProductNoticePeriod = {
      unit: TimeUnit.DAYS,
      value: 1,
    };
    const result = generateStartDate(startDate.toISOString(), noticePeriod);
    expect(isSameDay(result, startDate)).toBe(true);
  });
});

describe("generateEndDate", () => {
  it("should return the booking period end date when it is more than the minimum availability period", () => {
    const startDate = new Date();
    const bookingPeriod: ScheduleProductBookingPeriod = {
      unit: TimeUnit.WEEKS,
      value: 2,
    };
    const schedule: Pick<Schedule, "slots" | "products"> = {
      slots: [
        { day: "monday", intervals: [] },
        { day: "tuesday", intervals: [] },
      ],
      products: [],
    };
    const result = generateEndDate(schedule, startDate, bookingPeriod);
    const expected = add(startDate, {
      [bookingPeriod.unit]: bookingPeriod.value,
    });
    expect(isSameDay(result, expected)).toBe(true);
  });

  it("should not extend availability beyond the booking period", () => {
    const startDate = new Date();
    const bookingPeriod: ScheduleProductBookingPeriod = {
      unit: TimeUnit.WEEKS,
      value: 14,
    };
    const schedule: Pick<Schedule, "slots" | "products"> = {
      slots: [{ day: "monday", intervals: [] }],
      products: [],
    };
    const result = generateEndDate(schedule, startDate, bookingPeriod);
    const expected = add(startDate, {
      [bookingPeriod.unit]: bookingPeriod.value,
    });
    expect(isSameDay(result, expected)).toBe(true);
  });

  it("should limit availability to 14 slots when booking period is larger", () => {
    const startDate = new Date();
    const bookingPeriod: ScheduleProductBookingPeriod = {
      unit: TimeUnit.MONTHS,
      value: 4, // large booking period
    };

    const schedule: Pick<Schedule, "slots" | "products"> = {
      slots: [{ day: "monday", intervals: [] }], // only one slot per week
      products: [],
    };
    const result = generateEndDate(schedule, startDate, bookingPeriod);

    // Calculate the expected end date based on the number of slots and the frequency of slots
    const expected = add(startDate, { weeks: 14 }); // The function should limit the end date to 14 weeks, not the booking period
    expect(isSameDay(result, expected)).toBe(true);
  });
});
