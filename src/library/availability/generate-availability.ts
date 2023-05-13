import { add, differenceInMinutes, isAfter, isBefore } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import { Availability, Schedule } from "~/functions/schedule";
import { calculateMaxNoticeAndMinBookingPeriod } from "~/library/availability";

// Function to convert time string to Date object
function timeToDate(time: string, date: Date): Date {
  const [hour, minute] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setUTCHours(hour, minute, 0, 0);
  return newDate;
}

// Function to generate availability
export function generateAvailability(
  schedule: Pick<Schedule, "slots" | "products">,
  startDate: string
) {
  // Sort products by total time
  const sortedProducts = [...schedule.products].sort(
    (a, b) => b.duration + b.breakTime - (a.duration + a.breakTime)
  );

  const { bookingPeriod, noticePeriod } = calculateMaxNoticeAndMinBookingPeriod(
    schedule.products
  );

  const utcDate = zonedTimeToUtc(startDate, "UTC");
  const noticeDate = add(new Date(), {
    [noticePeriod.unit]: noticePeriod.value,
  });

  const start = isAfter(utcDate, noticeDate) ? utcDate : noticeDate;
  const end = add(new Date(), { [bookingPeriod.unit]: bookingPeriod.value });

  let currentDate = start;
  const availability: Availability[] = [];

  while (isBefore(currentDate, end)) {
    const dayOfWeek: string = enUS.localize?.day(currentDate.getDay()) || "";
    const daySchedule = schedule.slots.find(
      (slot) => slot.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (daySchedule) {
      const daySlots: Availability["slots"] = [];

      for (const interval of daySchedule.intervals) {
        let slotStart = timeToDate(interval.from, currentDate);
        let slotEnd = timeToDate(interval.to, currentDate);

        // Calculate total product time
        const totalProductTime = sortedProducts.reduce(
          (total, product) => total + product.duration + product.breakTime,
          0
        );

        while (
          differenceInMinutes(
            slotEnd,
            add(slotStart, { minutes: totalProductTime })
          ) >= 0
        ) {
          const slotProducts: Availability["slots"][number]["products"] = [];
          let productStartTime = slotStart;

          for (const product of sortedProducts) {
            const productEndTime = add(productStartTime, {
              minutes: product.duration,
            });
            slotProducts.push({
              productId: product.productId,
              from: productStartTime.toISOString(),
              to: productEndTime.toISOString(),
              breakTime: product.breakTime,
            });
            productStartTime = add(productEndTime, {
              minutes: product.breakTime,
            });
          }

          daySlots.push({
            from: slotStart.toISOString(),
            to: add(slotStart, { minutes: totalProductTime }).toISOString(),
            products: slotProducts,
          });

          slotStart = add(slotStart, { minutes: 15 });
        }
      }

      if (daySlots.length > 0) {
        availability.push({
          day: currentDate.toISOString(),
          slots: daySlots,
        });
      }
    }

    currentDate = add(currentDate, { days: 1 });
  }

  return availability;
}
