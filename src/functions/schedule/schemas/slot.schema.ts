import mongoose from "mongoose";
import { BadError } from "~/library/handler";
import { ScheduleInterval, ScheduleSlot } from "../schedule.types";

export const IntervalSchema = new mongoose.Schema<ScheduleInterval>(
  {
    to: String,
    from: String,
  },
  {
    _id: false,
  }
);

export const SlotSchema = new mongoose.Schema<ScheduleSlot>(
  {
    day: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      index: true,
    },
    intervals: [IntervalSchema],
  },
  { timestamps: true, _id: false }
);

function hasOverlappingIntervals(intervals: ScheduleInterval[]): boolean {
  const parsedIntervals = intervals.map((interval) => ({
    from: convertTimeStringToMinutes(interval.from),
    to: convertTimeStringToMinutes(interval.to),
  }));

  parsedIntervals.sort((a, b) => a.from - b.from);

  for (let i = 1; i < parsedIntervals.length; i++) {
    if (parsedIntervals[i].from < parsedIntervals[i - 1].to) {
      return true;
    }
  }

  return false;
}

function convertTimeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function validateSlots(slots: ScheduleSlot[]): void {
  // Check for duplicate days
  const uniqueDays = new Set(slots.map((slot) => slot.day));
  if (uniqueDays.size !== slots.length) {
    throw new BadError([
      {
        code: "custom",
        message: "Each day must be unique within slots",
        path: ["day"],
      },
    ]);
  }

  // Check for overlapping intervals
  for (const slot of slots) {
    if (hasOverlappingIntervals(slot.intervals)) {
      throw new BadError([
        {
          code: "custom",
          message: "Intervals within a slot must not overlap",
          path: ["intervals"],
        },
      ]);
    }
  }
}
