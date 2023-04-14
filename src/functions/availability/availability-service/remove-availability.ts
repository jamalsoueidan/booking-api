import { isWithinInterval } from "date-fns";
import { WidgetShift } from "../availability.types";

export type AvailabilityServiceRemoveShifts = {
  start: Date;
  end: Date;
  userId: string;
};

/**
 * Remove bookings from availabilities.
 *
 * @param availabilities - Array of availability shifts with user availability.
 * @param bookings - Array of bookings to be removed from availabilities.
 * @returns Updated availabilities array without the bookings.
 */
export const AvailabilityServiceRemoveAvailability = (
  availabilities: Array<WidgetShift>,
  bookings: Array<AvailabilityServiceRemoveShifts>
) => {
  // Iterate over bookings and update availabilities for each booking
  let filteredAvailabilities = availabilities.slice(); // create new copy of array
  bookings.forEach((booking) => {
    filteredAvailabilities = filteredAvailabilities.map(
      (shift: WidgetShift): WidgetShift => ({
        ...shift,
        hours: shift.hours.filter((hour) => {
          if (hour.user._id.toString() !== booking.userId.toString()) {
            return true;
          }
          return (
            !isWithinInterval(booking.start, hour) &&
            !isWithinInterval(booking.end, hour)
          );
        }),
      })
    );
  });
  return filteredAvailabilities;
};
