import {
  add,
  differenceInMinutes,
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { enUS } from "date-fns/locale";
import { Availability } from "~/functions/availability";
import { CustomerScheduleServiceGetWithCustomer } from "~/functions/customer/services";
import { LookupServiceCreate } from "~/functions/lookup";
import { calculateMaxNoticeAndMinBookingPeriod } from "~/library/availability";
import { generateEndDate, generateStartDate } from "./start-end-date";

export type GenerateAvailabilityProps = {
  schedule: Awaited<ReturnType<typeof CustomerScheduleServiceGetWithCustomer>>;
  lookup?: Awaited<ReturnType<typeof LookupServiceCreate>>;
  startDate: string;
};

// Function to generate availability
export const generateAvailability = async ({
  schedule,
  lookup,
  startDate: start,
}: GenerateAvailabilityProps) => {
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
    const dayOfWeek: string = format(utcToZonedTime(startDate, "UTC"), "EEEE", {
      locale: enUS,
    });

    const daySchedule = schedule.slots.find(
      (slot) => slot.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (daySchedule) {
      const daySlots: Availability["slots"] = [];

      for (const interval of daySchedule.intervals) {
        let slotStart = timeToDate(interval.from, startDate);
        let slotEnd = timeToDate(interval.to, startDate);

        if (isSameDay(new Date(), startDate)) {
          let now = new Date();
          now.setUTCHours(
            startDate.getUTCHours(),
            startDate.getUTCMinutes(),
            0,
            0
          );
          if (isWithinInterval(now, { start: slotStart, end: slotEnd })) {
            now = roundMinutes(now);
            slotStart = timeToDate(now.toISOString().slice(11, -8), startDate);
          } else {
            continue;
          }
        }

        const totalTraveltime = Math.round((lookup?.duration.value || 0) / 60);

        // Calculate total product time
        const totalProductTime = sortedProducts.reduce(
          (total, product) => total + product.duration + product.breakTime,
          0
        );

        while (
          differenceInMinutes(
            slotEnd,
            add(slotStart, { minutes: totalProductTime + totalTraveltime })
          ) >= 0
        ) {
          const slotProducts: Availability["slots"][number]["products"] = [];
          let productStartTime = slotStart;

          for (let i = 0; i < sortedProducts.length; i++) {
            const product = sortedProducts[i];

            const productEndTime = add(productStartTime, {
              minutes: product.duration + product.breakTime,
            });

            slotProducts.push({
              productId: product.productId,
              variantId: product.variantId,
              from: add(productStartTime, { minutes: totalTraveltime }),
              to: add(productEndTime, { minutes: totalTraveltime }),
              breakTime: product.breakTime,
              duration: product.duration,
            });

            productStartTime = productEndTime;
          }

          daySlots.push({
            from: slotStart,
            to: add(slotStart, { minutes: totalProductTime + totalTraveltime }),
            products: slotProducts,
          });

          slotStart = add(slotStart, { minutes: 15 });
        }
      }

      if (daySlots.length > 0) {
        availability.push({
          date: startDate,
          customer: {
            fullname: schedule.customer.fullname,
            customerId: schedule.customerId,
          },
          lookup,
          slots: daySlots,
        });
      }
    }

    startDate = add(startDate, { days: 1 });
  }

  return availability;
};

// Function to convert time string to Date object
function timeToDate(time: string, date: Date): Date {
  const [hour, minute] = time.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setUTCHours(hour, minute, 0, 0);
  return newDate;
}

function roundMinutes(date: Date) {
  date.setUTCHours(date.getUTCHours() + Math.round(date.getUTCMinutes() / 60));
  date.setUTCMinutes(0, 0, 0); // Resets also seconds and milliseconds

  return date;
}
