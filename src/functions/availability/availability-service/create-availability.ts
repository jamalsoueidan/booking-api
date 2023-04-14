import { addMinutes, isBefore, isSameDay } from "date-fns";
import { Product } from "~/functions/product";
import {
  AvailabilityHourRange,
  AvailabilityHourUser,
  AvailabilityShift,
} from "../availability.types";

type AvailabilityServiceCreateAvailabilityProduct = Pick<
  Product,
  "duration" | "buffertime"
>;
type AvailabilityServiceCreateAvailabilityShift = AvailabilityHourRange &
  AvailabilityHourUser;

export const AvailabilityServiceCreateAvailability = (
  product: AvailabilityServiceCreateAvailabilityProduct,
  schedules: AvailabilityServiceCreateAvailabilityShift[]
) =>
  schedules.reduce(
    (
      previous: Array<AvailabilityShift>,
      current: AvailabilityServiceCreateAvailabilityShift
    ) => {
      const scheduleEnd = new Date(current.end);
      const duration = product.duration || 60;
      const buffertime = product.buffertime || 0;
      const moveMinutes = 15;

      let start = new Date(current.start);
      let end;

      // Find if there's an existing AvailabilityShift in the 'previous' array with the same date as the current schedule
      const previousHours = previous.find((p) => isSameDay(p.date, start));
      const hours = previousHours?.hours || [];

      // Iterate through the schedule to create AvailabilityHours while the current start time is before the schedule end
      while (
        isBefore(addMinutes(start, 1), scheduleEnd) &&
        isBefore(addMinutes(start, duration + buffertime), scheduleEnd)
      ) {
        end = addMinutes(start, duration + buffertime);

        // Push a new AvailabilityHour with the user and the calculated start and end times
        hours.push({
          end,
          user: current.user,
          start,
        });

        // Move the start time forward by 15 minutes for the next iteration
        start = addMinutes(start, moveMinutes);
      }

      // If there's no existing AvailabilityShift with the same date, create a new one and add it to the 'previous' array
      if (!previousHours) {
        previous.push({
          date: current.start,
          start: current.start,
          end: current.end,
          bufferTime: product.buffertime || 60,
          duration: product.duration || 0,
          total: hours.length,
          hours,
        });
      }

      return previous;
    },
    []
  );
