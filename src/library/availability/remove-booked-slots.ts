import { areIntervalsOverlapping } from "date-fns";
import { Availability } from "~/functions/availability";

type DateInterval = { start: Date; end: Date };

export const removeBookedSlots = (
  availability: Availability[],
  bookedSlots: DateInterval[]
) => {
  if (bookedSlots.length === 0) {
    return availability;
  }

  return availability.map((avail) => ({
    ...avail,
    slots: avail.slots.filter((slot) => {
      const slotInterval = {
        start: slot.from,
        end: slot.to,
      };

      const isSlotOverlapping = bookedSlots.some((booked) => {
        return areIntervalsOverlapping(slotInterval, booked, {
          inclusive: true,
        });
      });
      return !isSlotOverlapping;
    }),
  }));
};
