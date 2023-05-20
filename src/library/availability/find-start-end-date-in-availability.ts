import { Availability } from "~/functions/schedule";

export const findStartAndEndDate = (availability: Availability[]) => {
  if (!availability || availability.length === 0) {
    throw new Error("No availability provided");
  }

  const dates = availability.map((a) => new Date(a.date));

  const startDate = new Date(
    Math.min.apply(
      null,
      dates.map((date) => date.getTime())
    )
  );
  const endDate = new Date(
    Math.max.apply(
      null,
      dates.map((date) => date.getTime())
    )
  );

  return { startDate, endDate };
};
