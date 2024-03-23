import { add, endOfMonth, isAfter, isPast } from "date-fns";
import {
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
  startDate: Date;
  bookingPeriod: ScheduleProductBookingPeriod;
};

export const generateEndDate = ({
  startDate,
  bookingPeriod,
}: generateEndDateProps) => {
  const endDateAllowed = add(new Date(), {
    [bookingPeriod.unit]: bookingPeriod.value,
  });
  const endMonth = endOfMonth(startDate);
  if (isAfter(endMonth, endDateAllowed)) {
    return endDateAllowed;
  }
  return endMonth;
};
