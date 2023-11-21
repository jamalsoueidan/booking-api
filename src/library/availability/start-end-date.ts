import { add, isAfter, isPast } from "date-fns";
import {
  Schedule,
  ScheduleProductBookingPeriod,
  ScheduleProductNoticePeriod,
} from "~/functions/schedule";

export type generateStartDateProps = {
  noticePeriod: ScheduleProductNoticePeriod;
  fromDate?: string;
};

// Function to generate the start date
export const generateStartDate = ({
  noticePeriod,
  fromDate,
}: generateStartDateProps) => {
  let startDate = new Date(fromDate || "");

  if (isPast(startDate) || !fromDate) {
    startDate = new Date();
  }

  const noticeDate = add(new Date(), {
    [noticePeriod.unit]: noticePeriod.value,
  });

  startDate = isAfter(startDate, noticeDate) ? startDate : noticeDate;
  return startDate;
};

export type generateEndDateProps = {
  schedule: Pick<Schedule, "slots" | "products">;
  startDate: Date;
  bookingPeriod: ScheduleProductBookingPeriod;
};

// Function to generate the end date
export const generateEndDate = ({
  schedule,
  startDate,
  bookingPeriod,
}: generateEndDateProps) => {
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
