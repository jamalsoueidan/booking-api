import { add, areIntervalsOverlapping, isWithinInterval } from "date-fns";
import { BookingModel } from "~/functions/booking";
import { ScheduleModel } from "~/functions/schedule/schedule.model";
import {
  Schedule,
  ScheduleInterval,
  ScheduleProduct,
} from "~/functions/schedule/schedule.types";
import { NotFoundError } from "~/library/handler";

function isSlotAvailable(
  slot: string,
  bookedSlots: Array<{ start: Date; end: Date }>,
  blockDates: Array<{ start: Date; end: Date }>,
  productDuration: number
): boolean {
  const slotStart = new Date(slot);
  const slotEnd = new Date(slotStart);
  slotEnd.setUTCMinutes(slotStart.getUTCMinutes() + productDuration);

  const booked = bookedSlots.some((bookedSlot) =>
    areIntervalsOverlapping({ start: slotStart, end: slotEnd }, bookedSlot)
  );

  const blocked = blockDates.some((blockDate) =>
    areIntervalsOverlapping({ start: slotStart, end: slotEnd }, blockDate)
  );

  return !booked && !blocked;
}

async function getBookedSlots(
  customerId: number,
  productId: number,
  startDate: Date,
  endDate: Date
) {
  const bookings = await BookingModel.find({
    customerId,
    productId,
    start: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  return bookings.map((booking) => ({
    start: booking.start,
    end: booking.end,
  }));
}

function generateTimeSlots(
  interval: ScheduleInterval,
  currentDate: Date,
  productDuration: number,
  breakTime: number
): string[] {
  const startTime = interval.from.split(":").map(Number);
  const endTime = interval.to.split(":").map(Number);

  const start = new Date(currentDate);
  start.setUTCHours(startTime[0], startTime[1]);

  const end = new Date(currentDate);
  end.setUTCHours(endTime[0], endTime[1]);

  const slots: string[] = [];

  while (start < end) {
    const nextSlot = new Date(start);
    nextSlot.setUTCMinutes(
      nextSlot.getUTCMinutes() + productDuration + breakTime
    );

    if (nextSlot <= end) {
      slots.push(start.toISOString());
    } else {
      break;
    }

    start.setUTCMinutes(start.getUTCMinutes() + 15);
  }

  return slots;
}

export type CustomerProductAvailabilityServiceGetProps = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
  startDate: Date;
};

export const CustomerProductAvailabilityServiceGet = async ({
  customerId,
  productId,
  startDate,
}: CustomerProductAvailabilityServiceGetProps) => {
  const schedule = await ScheduleModel.findOne({ customerId }).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "SCHEDULE_NOT_FOUND",
        path: ["schedule"],
      },
    ])
  );

  const blockDates = schedule.blockDates;

  const productExists = schedule.products.find(
    (product) => product.productId === productId
  );

  if (!productExists) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["product"],
      },
    ]);
  }

  const noticePeriod = {
    value: productExists.noticePeriod.value,
    unit: productExists.noticePeriod.unit,
  };

  const bookingPeriod = {
    value: productExists.bookingPeriod.value,
    unit: productExists.bookingPeriod.unit,
  };

  const minStartDate = add(new Date(), {
    [noticePeriod.unit]: noticePeriod.value,
  });

  const maxEndDate = add(new Date(), {
    [bookingPeriod.unit]: bookingPeriod.value,
  });

  const bookingInterval = { start: minStartDate, end: maxEndDate };

  const bookedSlots = await getBookedSlots(
    customerId,
    productId,
    startDate,
    maxEndDate
  );

  const productDuration = productExists.duration;
  const breakTime = productExists.breakTime;
  const currentDate = new Date(startDate);

  const availableSlots: Array<{ date: string; slots: string[] }> = [];

  while (currentDate < maxEndDate) {
    const dayOfWeek = currentDate
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();
    const slot = schedule.slots.find((slot) => slot.day === dayOfWeek);

    if (slot) {
      const slotsForDay: string[] = [];

      for (const interval of slot.intervals) {
        const generatedSlots = generateTimeSlots(
          interval,
          currentDate,
          productDuration,
          breakTime
        );
        for (const slot of generatedSlots) {
          const slotDate = new Date(slot);
          const available =
            isSlotAvailable(slot, bookedSlots, blockDates, productDuration) &&
            isWithinInterval(slotDate, bookingInterval);
          if (available) {
            slotsForDay.push(slot);
          }
        }
      }

      if (slotsForDay.length > 0) {
        availableSlots.push({
          date: currentDate.toISOString(),
          slots: slotsForDay,
        });
      }
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return availableSlots;
};
