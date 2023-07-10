import { isAfter, isBefore, isEqual } from "date-fns";
import { Availability } from "~/functions/availability";

type DateInterval = { from: Date; to: Date };

export const removeBookedSlots = (
  availability: Availability[],
  bookedSlots: DateInterval[]
) => {
  const isOverlap = (slot1: DateInterval, slot2: DateInterval) => {
    return (
      ((isAfter(slot1.from, slot2.from) || isEqual(slot1.from, slot2.from)) &&
        isBefore(slot1.from, slot2.to)) ||
      ((isAfter(slot2.from, slot1.from) || isEqual(slot2.from, slot1.from)) &&
        isBefore(slot2.from, slot1.to))
    );
  };

  for (const bookedSlot of bookedSlots) {
    for (const availabilityDay of availability) {
      availabilityDay.slots = availabilityDay.slots.filter((slot) => {
        return !isOverlap(slot, bookedSlot);
      });
    }
  }

  // Filter out days without slots
  return availability.filter((day) => day.slots.length > 0);
};
