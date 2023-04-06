import {
  addHours,
  eachDayOfInterval,
  format,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  subHours,
} from "date-fns";
import { Shift } from "./shift.types";

type ShiftServiceRange = Pick<Shift, "start" | "end">;

export const getDaysFromRange = (days: string[], range: ShiftServiceRange) => {
  const daysOfInterval = eachDayOfInterval(range);
  return daysOfInterval.filter((date) =>
    days.includes(format(date, "EEEE").toLowerCase())
  );
};

export const createDateTime = (date: Date, time: Date) =>
  resetTime(new Date(`${format(date, "yyyy-MM-dd")} ${format(time, "pp")}`));

export const resetTime = (value: Date) =>
  setMinutes(setSeconds(setMilliseconds(value, 0), 0), 0);

export const handleWinterSummerTime = (
  range: ShiftServiceRange,
  shifts: Array<Omit<Shift, "_id">>
) =>
  shifts.map((shift) => {
    const startDateTime = range.start;
    const endDateTime = range.end;

    let start = setHours(shift.start, getHours(startDateTime));
    let end = setHours(shift.end, getHours(endDateTime));

    /* ************ */
    /*  WINTER TIME */
    /* ************ */
    // startDateTime is before 30 oct
    const beforeAdd =
      isBefore(startDateTime, new Date(shift.start.getFullYear(), 9, 30)) &&
      isAfter(start, new Date(shift.start.getFullYear(), 9, 30)); // 9 is for october

    // startDateTime is after 30 oct, and current is before subs
    const afterSubs =
      isAfter(startDateTime, new Date(shift.start.getFullYear(), 9, 30)) && // 9 is for october
      isBefore(start, new Date(shift.start.getFullYear(), 9, 30));

    /* ************ */
    /*  SUMMER TIME */
    /* ************ */
    // startDateTime is after 27 march, and current is before
    const afterAdd =
      isAfter(startDateTime, new Date(shift.start.getFullYear(), 2, 27)) &&
      isBefore(start, new Date(shift.start.getFullYear(), 2, 27)); // 2 is for march

    // startDateTime is before 27 march, and current is after
    const beforeSubs =
      isBefore(startDateTime, new Date(shift.start.getFullYear(), 2, 27)) &&
      isAfter(start, new Date(shift.start.getFullYear(), 2, 27)); // 2 is for march

    if (beforeAdd || afterAdd) {
      start = addHours(start, 1);
      end = addHours(end, 1);
    } else if (afterSubs || beforeSubs) {
      start = subHours(start, 1);
      end = subHours(end, 1);
    }

    start = setMinutes(start, getMinutes(startDateTime));
    end = setMinutes(end, getMinutes(endDateTime));

    return {
      ...shift,
      end,
      start,
    };
  });
