import { z } from "zod";
import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import {
  BooleanOrString,
  GidFormat,
  NumberOrString,
  StringOrObjectId,
} from "~/library/zod";

export enum TimeUnit {
  HOURS = "hours",
  DAYS = "days",
  WEEKS = "weeks",
  MONTHS = "months",
}

export enum SlotWeekDays {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

const BookingPeriodZodSchema = z.object({
  valueMetafieldId: z.string().optional(),
  value: NumberOrString,
  unitMetafieldId: z.string().optional(),
  unit: z.enum([TimeUnit.WEEKS, TimeUnit.MONTHS]),
});

export type ScheduleProductBookingPeriod = z.infer<
  typeof BookingPeriodZodSchema
>;

const NoticePeriodZodSchema = z.object({
  valueMetafieldId: z.string().optional(),
  value: NumberOrString,
  unitMetafieldId: z.string().optional(),
  unit: z.enum([
    TimeUnit.HOURS,
    TimeUnit.DAYS,
    TimeUnit.WEEKS,
    TimeUnit.MONTHS,
  ]),
});

export type ScheduleProductNoticePeriod = z.infer<typeof NoticePeriodZodSchema>;

const LocationZodSchema = z.object({
  location: StringOrObjectId,
  locationType: z.nativeEnum(LocationTypes),
  originType: z.nativeEnum(LocationOriginTypes),
});

export type ScheduleProductLocation = z.infer<typeof LocationZodSchema>;

export const ScheduleProductOptionZodSchema = z.object({
  productId: GidFormat,
  title: z.string(),
  variants: z.array(
    z.object({
      variantId: GidFormat,
      title: z.string(),
      price: NumberOrString,
      duration: z.object({
        metafieldId: GidFormat,
        value: NumberOrString,
      }),
    })
  ),
});

export type ScheduleProductOption = z.infer<
  typeof ScheduleProductOptionZodSchema
>;

export const ScheduleProductZodSchema = z.object({
  optionsMetafieldId: z.string().optional(),
  options: z.array(ScheduleProductOptionZodSchema).optional(),
  productHandle: z.string(),
  parentId: GidFormat,
  productId: GidFormat,
  variantId: GidFormat,
  user: z
    .object({
      metaobjectId: z.string().optional(),
      value: z.string().optional(),
    })
    .optional(),
  hideFromProfileMetafieldId: z.string().optional(),
  hideFromProfile: BooleanOrString,
  hideFromCombineMetafieldId: z.string().optional(),
  hideFromCombine: BooleanOrString,
  title: z.string().optional(),
  scheduleIdMetafieldId: z.string().optional(),
  locationsMetafieldId: z.string().optional(),
  locations: z.array(LocationZodSchema),
  price: z.object({
    amount: z.string(),
    currencyCode: z.string().optional(),
  }),
  compareAtPrice: z.object({
    amount: z.string(),
    currencyCode: z.string().optional(),
  }),
  description: z.string().optional(),
  durationMetafieldId: z.string().optional(),
  duration: NumberOrString,
  breakTimeMetafieldId: z.string().optional(),
  breakTime: NumberOrString,
  noticePeriod: NoticePeriodZodSchema,
  bookingPeriod: BookingPeriodZodSchema,
});

export type ScheduleProduct = z.infer<typeof ScheduleProductZodSchema>;

const HourMinuteSchema = z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/);

export const ScheduleSlotIntervalZodSchema = z
  .object({
    from: HourMinuteSchema,
    to: HourMinuteSchema,
  })
  .refine(
    (data) => {
      const from = data.from.split(":").map(Number);
      const to = data.to.split(":").map(Number);

      // check if 'from' is before 'to'
      if (from[0] > to[0] || (from[0] === to[0] && from[1] >= to[1])) {
        return false;
      }

      // check if the interval is minimum one hour
      if (to[0] - from[0] < 1 && to[1] <= from[1]) {
        return false;
      }

      return true;
    },
    {
      message: "Invalid interval: 'from' must be at least an hour before 'to'",
    }
  );

export type ScheduleSlotInterval = z.infer<
  typeof ScheduleSlotIntervalZodSchema
>;

const ScheduleSlotIntervalArraySchema = z
  .array(ScheduleSlotIntervalZodSchema)
  .refine(
    (data) => {
      const intervals = data
        .map((interval) => ({
          from: interval.from.split(":").map(Number),
          to: interval.to.split(":").map(Number),
        }))
        .sort((a, b) => a.from[0] - b.from[0] || a.from[1] - b.from[1]); // sorting

      for (let i = 0; i < intervals.length - 1; i++) {
        if (
          intervals[i].to[0] > intervals[i + 1].from[0] ||
          (intervals[i].to[0] === intervals[i + 1].from[0] &&
            intervals[i].to[1] >= intervals[i + 1].from[1])
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message: "Invalid schedule: intervals cannot overlap",
    }
  );

export const ScheduleSlotZodSchema = z.object({
  day: z.nativeEnum(SlotWeekDays),
  intervals: ScheduleSlotIntervalArraySchema,
});

export type ScheduleSlot = z.infer<typeof ScheduleSlotZodSchema>;

export const ScheduleSlotsZodSchema = z
  .array(ScheduleSlotZodSchema)
  .transform((slots) => slots.filter((slot) => slot.intervals.length > 0))
  .superRefine((slots, ctx) => {
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
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate day found at index ${duplicateIndex}`,
        path: [`slots[${duplicateIndex}].day`],
      });
      return false;
    }
    return true;
  });

export const ScheduleZodSchema = z.object({
  _id: StringOrObjectId,
  name: z.string(),
  customerId: GidFormat,
  slots: ScheduleSlotsZodSchema,
  products: z.array(ScheduleProductZodSchema),
});

export type Schedule = z.infer<typeof ScheduleZodSchema>;
