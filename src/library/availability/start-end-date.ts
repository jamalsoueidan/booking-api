import { add, endOfMonth, isAfter, isPast } from "date-fns";
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
  const end = add(startDate, { [bookingPeriod.unit]: bookingPeriod.value });
  const endMonth = endOfMonth(startDate);
  if (isAfter(endMonth, end)) {
    return end;
  }
  return endMonth;
};
