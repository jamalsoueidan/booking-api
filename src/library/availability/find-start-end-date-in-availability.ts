import { Availability } from "~/functions/availability";

export const findStartAndEndDate = (availability: Availability[]) => {
  const startDates = availability.map((a) => a.slots[0].from);

  const startDate = new Date(
    Math.min.apply(
      null,
      startDates.map((date) => date.getTime())
    )
  );

  const endDates = availability.map((a) => a.slots[a.slots.length - 1].to);

  const endDate = new Date(
    Math.max.apply(
      null,
      endDates.map((date) => date.getTime())
    )
  );

  return { startDate, endDate };
};
