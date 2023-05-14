import { add, isAfter } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import {
  Schedule,
  ScheduleProductBookingPeriod,
  ScheduleProductNoticePeriod,
} from "~/functions/schedule";

// Function to generate the start date
export const generateStartDate = (
  start: string,
  noticePeriod: ScheduleProductNoticePeriod
) => {
  let startDate = zonedTimeToUtc(start, "UTC");
  const noticeDate = add(new Date(), {
    [noticePeriod.unit]: noticePeriod.value,
  });

  startDate = isAfter(startDate, noticeDate) ? startDate : noticeDate;

  return startDate;
};

// Function to generate the end date
export const generateEndDate = (
  schedule: Pick<Schedule, "slots" | "products">,
  startDate: Date,
  bookingPeriod: ScheduleProductBookingPeriod
) => {
  // Calculate the booking period end date
  let end = add(startDate, { [bookingPeriod.unit]: bookingPeriod.value });

  // Calculate the number of weeks needed for 14 slots
  const slotDaysCount = schedule.slots.length;
  const weeksFor14Slots = Math.ceil(14 / slotDaysCount);

  // Calculate the end date for 14 slots
  const endFor14Slots = add(startDate, { weeks: weeksFor14Slots });

  // If the end date for 14 slots is later than the booking period end date, use the booking period end date
  if (isAfter(endFor14Slots, end)) {
    return end;
  }

  // Otherwise, use the end date for 14 slots
  return endFor14Slots;
};
