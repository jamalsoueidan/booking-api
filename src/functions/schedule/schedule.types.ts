import mongoose from "mongoose";
import { z } from "zod";

const NumberOrStringType = z
  .union([z.number(), z.string()])
  .transform((value) =>
    typeof value === "string" ? parseInt(value, 10) : value
  );

const isValidObjectId = (value: any): value is string =>
  mongoose.Types.ObjectId.isValid(value);

const ObjectIdType = z
  .custom<string>(isValidObjectId, {
    message: "Invalid ObjectId",
  })
  .transform((value) => new mongoose.Types.ObjectId(value));

export const IntervalZodSchema = z.object({
  from: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  to: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
});

export type ScheduleInterval = z.infer<typeof IntervalZodSchema>;

export const SlotZodSchema = z.object({
  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),
  intervals: z.array(IntervalZodSchema),
});

export type ScheduleSlot = z.infer<typeof SlotZodSchema>;

export const ScheduleZodSchema = z.object({
  _id: z.union([z.string(), ObjectIdType]),
  name: z.string(),
  customerId: NumberOrStringType,
  slots: z.array(SlotZodSchema),
});

export type Schedule = z.infer<typeof ScheduleZodSchema>;
