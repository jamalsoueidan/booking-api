import mongoose from "mongoose";
import { BadError } from "~/library/handler";
import {
  ScheduleSlot,
  ScheduleSlotInterval,
  SlotWeekDays,
} from "../schedule.types";

export const IntervalSchema = new mongoose.Schema<ScheduleSlotInterval>(
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
        SlotWeekDays.MONDAY,
        SlotWeekDays.TUESDAY,
        SlotWeekDays.WEDNESDAY,
        SlotWeekDays.THURSDAY,
        SlotWeekDays.FRIDAY,
        SlotWeekDays.SATURDAY,
        SlotWeekDays.SUNDAY,
      ],
      index: true,
    },
    intervals: [IntervalSchema],
  },
  { _id: false }
);

export function validateSlots(slots: ScheduleSlot[]): void {
  // Check for duplicate days
  const dayIndexMap = new Map();
  let duplicateIndex = -1;

  slots.forEach((slot, index) => {
    if (dayIndexMap.has(slot.day)) {
      duplicateIndex = index;
    } else {
      dayIndexMap.set(slot.day, index);
    }
  });

  if (duplicateIndex !== -1) {
    throw new BadError([
      {
        code: "custom",
        message: "Each day must be unique within slots",
        path: [`slots[${duplicateIndex}].day`],
      },
    ]);
  }

  // Check for overlapping intervals
  for (const [slotIndex, slot] of slots.entries()) {
    const overlappingIntervalsIndex = findOverlappingIntervalsIndex(
      slot.intervals
    );
    if (overlappingIntervalsIndex !== -1) {
      throw new BadError([
        {
          code: "custom",
          message: "Intervals within a slot must not overlap",
          path: [
            `slots[${slotIndex}].intervals[${overlappingIntervalsIndex}].to`,
            `slots[${slotIndex}].intervals[${overlappingIntervalsIndex}].from`,
          ],
        },
      ]);
    }
  }
}

function findOverlappingIntervalsIndex(
  intervals: ScheduleSlotInterval[]
): number {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      if (isOverlapping(intervals[i], intervals[j])) {
        return i;
      }
    }
  }
  return -1;
}

function isOverlapping(
  a: ScheduleSlotInterval,
  b: ScheduleSlotInterval
): boolean {
  return a.from < b.to && b.from < a.to;
}
