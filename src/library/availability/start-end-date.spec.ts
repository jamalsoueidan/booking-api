import { add, endOfMonth, isSameDay } from "date-fns";
import {
  Schedule,
  ScheduleProductBookingPeriod,
  ScheduleProductNoticePeriod,
  TimeUnit,
} from "~/functions/schedule";
import { generateEndDate, generateStartDate } from "./start-end-date";

describe("generateStartDate", () => {
  it("should return the correct start date when notice period has not passed", () => {
    const fromDate = new Date().toISOString();
    const noticePeriod: ScheduleProductNoticePeriod = {
      unit: TimeUnit.DAYS,
      value: 2,
    };
    const result = generateStartDate({
      fromDate,
      noticePeriod,
    });
    const expected = add(new Date(), {
      [noticePeriod.unit]: noticePeriod.value,
    });
    expect(result.toISOString().slice(0, -4)).toStrictEqual(
      expected.toISOString().slice(0, -4)
    );
  });

  it("should return the start date when notice period has already passed", () => {
    const fromDate = add(new Date(), { days: 2 }).toISOString();
    const noticePeriod: ScheduleProductNoticePeriod = {
      unit: TimeUnit.DAYS,
      value: 1,
    };

    const result = generateStartDate({
      fromDate,
      noticePeriod,
    });
    expect(result.toISOString().slice(0, -4)).toStrictEqual(
      fromDate.slice(0, -4)
    );
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
    const result = generateEndDate({
      schedule,
      startDate,
      bookingPeriod,
    });
    const expected = add(startDate, {
      [bookingPeriod.unit]: bookingPeriod.value,
    });

    expect(isSameDay(result, expected)).toBe(true);
  });

  it("should limit availability to end of month when booking period is larger", () => {
    const startDate = new Date();
    const bookingPeriod: ScheduleProductBookingPeriod = {
      unit: TimeUnit.MONTHS,
      value: 4, // large booking period
    };

    const schedule: Pick<Schedule, "slots" | "products"> = {
      slots: [{ day: "monday", intervals: [] }], // only one slot per week
      products: [],
    };
    const result = generateEndDate({
      schedule,
      startDate,
      bookingPeriod,
    });

    const expected = endOfMonth(startDate); // The function should limit the end date to end of month, not the booking period
    expect(isSameDay(result, expected)).toBe(true);
  });
});
