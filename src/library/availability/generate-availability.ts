import { add, differenceInMinutes, isBefore } from "date-fns";
import { enUS } from "date-fns/locale";
import { Availability, Schedule } from "~/functions/schedule";
import { calculateMaxNoticeAndMinBookingPeriod } from "~/library/availability";
import { generateEndDate, generateStartDate } from "./start-end-date";

// Function to convert time string to Date object
function timeToDate(time: string, date: Date): Date {
  const [hour, minute] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setUTCHours(hour, minute, 0, 0);
  return newDate;
}

// Function to generate availability
export const generateAvailability = (
  schedule: Pick<Schedule, "slots" | "products">,
  start: string
) => {
  // Sort products by total time
  const sortedProducts = [...schedule.products].sort(
    (a, b) => b.duration + b.breakTime - (a.duration + a.breakTime)
  );

  const { bookingPeriod, noticePeriod } = calculateMaxNoticeAndMinBookingPeriod(
    schedule.products
  );

  let startDate = generateStartDate(start, noticePeriod);
  const endDate = generateEndDate(schedule, startDate, bookingPeriod);

  const availability: Availability[] = [];

  while (isBefore(startDate, endDate)) {
    const dayOfWeek: string = enUS.localize?.day(startDate.getDay()) || "";
    const daySchedule = schedule.slots.find(
      (slot) => slot.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (daySchedule) {
      const daySlots: Availability["slots"] = [];

      for (const interval of daySchedule.intervals) {
        let slotStart = timeToDate(interval.from, startDate);
        let slotEnd = timeToDate(interval.to, startDate);

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
          day: startDate.toISOString(),
          slots: daySlots,
        });
      }
    }

    startDate = add(startDate, { days: 1 });
  }

  return availability;
};
