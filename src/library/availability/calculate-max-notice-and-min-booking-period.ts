import { addDays, addHours, addMonths, addWeeks } from "date-fns";
import { Schedule, TimeUnit } from "~/functions/schedule";

/*
 * Notice Period: The notice period is the amount of advance notice required for booking an appointment.
 * It specifies how much time in advance a user or customer must provide before they can schedule an appointment.
 * The notice period can vary depending on the nature of the appointment and the specific requirements of the service provider.
 * For example, some businesses may require a notice period of 24 hours, while others may require a week or more.
 *
 * Booking Period: The booking period, on the other hand, refers to the duration within which appointments can be scheduled.
 * It indicates the time frame during which a user or customer can select an available slot for their appointment.
 * The booking period can vary depending on the application or platform used for appointment scheduling. It might span a few days,
 * a week, or even longer, depending on the availability and preferences of the service provider.
 */
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
  const referenceDate = new Date();

  switch (unit) {
    case "hours":
      return addHours(referenceDate, value).getTime() - referenceDate.getTime();
    case "days":
      return addDays(referenceDate, value).getTime() - referenceDate.getTime();
    case "weeks":
      return addWeeks(referenceDate, value).getTime() - referenceDate.getTime();
    case "months":
      return (
        addMonths(referenceDate, value).getTime() - referenceDate.getTime()
      );
    default:
      return 0;
  }
};
