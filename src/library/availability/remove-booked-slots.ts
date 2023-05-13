import { isAfter, isBefore, isEqual, parseISO } from "date-fns";
import { Availability, ScheduleInterval } from "~/functions/schedule";

export const removeBookedSlots = (
  availability: Availability[],
  bookedSlots: ScheduleInterval[]
) => {
  const isOverlap = (slot1: ScheduleInterval, slot2: ScheduleInterval) => {
    const slot1From = parseISO(slot1.from);
    const slot1To = parseISO(slot1.to);
    const slot2From = parseISO(slot2.from);
    const slot2To = parseISO(slot2.to);

    return (
      ((isAfter(slot1From, slot2From) || isEqual(slot1From, slot2From)) &&
        isBefore(slot1From, slot2To)) ||
      ((isAfter(slot2From, slot1From) || isEqual(slot2From, slot1From)) &&
        isBefore(slot2From, slot1To))
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
