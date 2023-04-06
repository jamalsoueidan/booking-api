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

const date = z.string().pipe(z.coerce.date());

export const ShiftSchema = z.object({
  _id: z.string(),
  end: z.coerce.date(),
  groupId: z.string().optional(),
  userId: z.string(),
  start: z.coerce.date(),
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

export const ShiftDaysSchema = z.array(ShiftDaysEnum).nonempty();

export type ShiftDaysInterval = z.infer<typeof ShiftDaysEnum>;
