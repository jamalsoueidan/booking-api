import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  differenceInHours,
  startOfDay,
} from "date-fns";
import { Schedule, TimeUnit } from "~/functions/schedule";

export const calculateMaxNoticeAndMinBookingPeriod = (
  products: Schedule["products"]
) => {
  return products.reduce(
    (acc, curr) => {
      const noticeDuration = calculateUnitValue(
        curr.noticePeriod.unit,
        curr.noticePeriod.value
      );
      const bookingDuration = calculateUnitValue(
        curr.bookingPeriod.unit,
        curr.bookingPeriod.value
      );

      if (
        noticeDuration >
        calculateUnitValue(acc.noticePeriod.unit, acc.noticePeriod.value)
      ) {
        acc.noticePeriod = curr.noticePeriod;
      }

      if (
        bookingDuration <
        calculateUnitValue(acc.bookingPeriod.unit, acc.bookingPeriod.value)
      ) {
        acc.bookingPeriod = curr.bookingPeriod;
      }

      return acc;
    },
    {
      noticePeriod: products[0].noticePeriod,
      bookingPeriod: products[0].bookingPeriod,
    }
  );
};

const calculateUnitValue = (unit: TimeUnit, value: number) => {
  const referenceDate = startOfDay(new Date());

  switch (unit) {
    case "hours":
      return differenceInHours(referenceDate, addHours(referenceDate, value));
    case "days":
      return differenceInHours(referenceDate, addDays(referenceDate, value));
    case "weeks":
      return differenceInHours(referenceDate, addWeeks(referenceDate, value));
    case "months":
      return differenceInHours(referenceDate, addMonths(referenceDate, value));
    default:
      return 0;
  }
};
