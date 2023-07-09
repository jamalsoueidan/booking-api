import { format, isBefore, parse } from "date-fns";
import {
  Schedule,
  ScheduleModel,
  ScheduleSlot,
  ScheduleSlotInterval,
} from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

const getScheduleWithProduct = async (
  customerId: number,
  productId: number
) => {
  const schedule = await ScheduleModel.findOne({
    customerId,
    products: {
      $elemMatch: {
        productId,
      },
    },
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    )
    .lean();

  return schedule;
};

export const mergeIntervals = (
  prev: ScheduleSlotInterval[],
  next: ScheduleSlotInterval[]
) => {
  const merged: ScheduleSlotInterval[] = [];

  prev.forEach((prevInterval) => {
    next.forEach((nextInterval) => {
      const prevStart = parse(prevInterval.from, "HH:mm", new Date(0));
      const prevEnd = parse(prevInterval.to, "HH:mm", new Date(0));
      const nextStart = parse(nextInterval.from, "HH:mm", new Date(0));
      const nextEnd = parse(nextInterval.to, "HH:mm", new Date(0));

      if (isBefore(prevStart, nextEnd) && isBefore(nextStart, prevEnd)) {
        const start = isBefore(prevStart, nextStart) ? nextStart : prevStart;
        const end = isBefore(prevEnd, nextEnd) ? prevEnd : nextEnd;

        const isOverlapping = merged.some(
          (mergedInterval) =>
            isBefore(parse(mergedInterval.from, "HH:mm", new Date(0)), end) &&
            isBefore(start, parse(mergedInterval.to, "HH:mm", new Date(0)))
        );

        if (!isOverlapping) {
          merged.push({
            from: format(start, "HH:mm"),
            to: format(end, "HH:mm"),
          });
        }
      }
    });
  });

  return merged;
};

export const mergeSlots = (prev: Schedule, next: Schedule) => {
  const sharedSlots: ScheduleSlot[] = [];

  prev.slots.forEach((rootSlot) => {
    next.slots.forEach((nextSlot) => {
      if (rootSlot.day === nextSlot.day) {
        sharedSlots.push({
          day: rootSlot.day,
          intervals: mergeIntervals(rootSlot.intervals, nextSlot.intervals),
        });
      }
    });
  });

  return sharedSlots;
};

const getRemainingSchedules = async (
  customerId: number,
  rootSchedule: Schedule
): Promise<Schedule[]> => {
  const allSchedules = await ScheduleModel.find({ customerId });

  return allSchedules.filter((schedule) =>
    schedule.products.every(
      (product) =>
        !rootSchedule.products.some(
          (rootProduct) => rootProduct.productId === product.productId
        )
    )
  );
};

export const compareSchedule = async (
  customerId: number,
  productIds: number[]
) => {
  let [rootProductId, ...restProductIds] = productIds;
  const rootSchedule = await getScheduleWithProduct(customerId, rootProductId);

  // remove product ids from restProductIds that are inside rootSchedule.products
  restProductIds = restProductIds.filter(
    (productId) =>
      !rootSchedule.products.some((product) => product.productId === productId)
  );

  // validate the next ids that coming from prop
  for (const nextProductId of restProductIds) {
    const nextSchedule = await getScheduleWithProduct(
      customerId,
      nextProductId
    );
    const slots = mergeSlots(rootSchedule, nextSchedule);
    if (slots.length > 0) {
      rootSchedule.slots = slots;
      rootSchedule.products.push(...nextSchedule.products);
    }
  }

  // find the rest of schedules that don't contain any of the products inside rootSchedule and belong to the same customerId
  const remainingSchedules = await getRemainingSchedules(
    customerId,
    rootSchedule
  );

  for (const remainingSchedule of remainingSchedules) {
    const slots = mergeSlots(rootSchedule, remainingSchedule);
    if (slots.length > 0) {
      rootSchedule.slots = slots;
      rootSchedule.products.push(...remainingSchedule.products);
    }
  }

  return rootSchedule;
};
