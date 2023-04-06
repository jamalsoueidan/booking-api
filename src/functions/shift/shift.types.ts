import { z } from "zod";

export enum Tag {
  "weekday" = "weekday",
  "weekend" = "weekend",
  "all_day" = "all_day",
  "end_of_week" = "end_of_week",
  "start_of_week" = "start_of_week",
  "middle_of_week" = "middle_of_week",
}

export const TagKeys = Object.values(Tag).filter(
  (x, i, a) => a.indexOf(x) === i
);

const date = z
  .string()
  .refine(
    (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    {
      message: "Invalid date string",
      path: [],
    }
  )
  .transform((value) => new Date(value));

export const ShiftSchema = z.object({
  _id: z.string(),
  end: date,
  groupId: z.string().optional(),
  userId: z.string(),
  start: date,
  tag: z.nativeEnum(Tag),
});

export type Shift = z.infer<typeof ShiftSchema>;

export const ShiftDaysEnum = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export type ShiftDaysInterval = z.infer<typeof ShiftDaysEnum>;
