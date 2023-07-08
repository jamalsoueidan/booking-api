import {
  addDays,
  differenceInMinutes,
  format,
  isWithinInterval,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Booking, BookingModel } from "~/functions/booking";
import { LocationTypes } from "~/functions/location";
import { WeekDays } from "~/functions/schedule";
import { arrayElements, createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { CustomerAvailabilityServiceGet } from "./availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerAvailabilityService", () => {
  const customerId = 1;
  let user: Awaited<ReturnType<typeof createUser>>;
  let schedule: Awaited<ReturnType<typeof createSchedule>>;
  let location1: Awaited<ReturnType<typeof createLocation>>;
  let location2: Awaited<ReturnType<typeof createLocation>>;

  const todayInUTC = utcToZonedTime(new Date(), "Etc/UTC");

  const nextDayInUTC = format(
    addDays(todayInUTC, 1),
    "iiii"
  ).toLowerCase() as WeekDays;

  const dayAfterNextInUTC = format(
    addDays(todayInUTC, 2),
    "iiii"
  ).toLowerCase() as WeekDays;

  const days = [nextDayInUTC];

  beforeEach(async () => {
    user = await createUser({ customerId });

    location1 = await createLocation(
      { customerId },
      { locationType: LocationTypes.ORIGIN }
    );

    location2 = await createLocation(
      { customerId },
      { locationType: LocationTypes.DESTINATION }
    );

    schedule = await createSchedule(
      { customerId },
      {
        totalProducts: 2,
        days,
        locations: [
          {
            location: location1._id,
            locationType: location1.locationType,
          },
          {
            location: location2._id,
            locationType: location2.locationType,
          },
        ],
      }
    );
  });

  it("should return available slots for the given date range and product", async () => {
    const productIds = arrayElements(schedule.products, 2).map(
      (product) => product.productId
    );

    const result = await CustomerAvailabilityServiceGet(
      {
        customerId,
        locationId: location1._id,
      },
      {
        productIds,
        startDate: new Date().toISOString(),
      }
    );

    const interval = {
      start: new Date(`1970-01-01T${schedule.slots[0].intervals[0].from}:00Z`),
      end: new Date(`1970-01-01T${schedule.slots[0].intervals[0].to}:00Z`),
    };

    result.forEach((item) => {
      // All items is either one of the weekDays I have, no other weekdays.
      const date = new Date(item.date);
      const day = format(date, "eeee").toLowerCase(); // get day of week
      expect(days).toContain(day);

      item.slots.forEach((slot) => {
        // check each slot (start, to) if they are within the interval
        const slotFromTime = new Date(
          Date.UTC(
            1970,
            0,
            1,
            slot.from.getUTCHours(),
            slot.from.getUTCMinutes()
          )
        );
        const slotToTime = new Date(
          Date.UTC(1970, 0, 1, slot.to.getUTCHours(), slot.to.getUTCMinutes())
        );

        expect(isWithinInterval(slotFromTime, interval)).toBe(true);
        expect(isWithinInterval(slotToTime, interval)).toBe(true);

        // Validate slot.from, slot.to, to be total of all products
        const slotFrom = new Date(slot.from);
        const slotTo = new Date(slot.to);
        const slotTotalTime = differenceInMinutes(slotTo, slotFrom);
        let totalProductTime = 0;

        slot.products.forEach((product) => {
          // // All products duration + breaktime is correct
          const productFrom = new Date(product.from);
          const productTo = new Date(product.to);
          const productTotalTime = differenceInMinutes(productTo, productFrom);
          totalProductTime += productTotalTime;
          expect(productTotalTime).toEqual(
            product.duration + product.breakTime
          );
        });

        expect(slotTotalTime).toEqual(totalProductTime);
      });
    });
  });

  it("should return available slots and removed booked slots", async () => {
    const productIds = arrayElements(schedule.products, 2).map(
      (product) => product.productId
    );

    let result = await CustomerAvailabilityServiceGet(
      {
        customerId,
        locationId: "",
      },
      { productIds, startDate: new Date().toISOString() }
    );

    const targetFromTime = result[0].slots[0].from;
    const targetToTime = result[0].slots[0].to;

    const booking: Booking = {
      orderId: 56009676557,
      buyer: {
        id: 7106990342471,
        fullName: "jamal soueidan",
        phone: "+4531317428",
        email: "jamal@soueidan.com",
      },
      lineItems: [
        {
          lineItemId: 14551587684679,
          productId: productIds[0],
          variantId: 46727191036231,
          title: "Børneklip (fra 6 år)",
          priceSet: {
            amount: "0.00",
            currency_code: "DKK",
          },
          totalDiscountSet: {
            amount: "0.00",
            currency_code: "DKK",
          },
          from: targetFromTime,
          to: targetToTime,
          customerId: 1,
        },
      ],
    };

    await BookingModel.create(booking);

    result = await CustomerAvailabilityServiceGet(
      {
        customerId,
        locationId: "",
      },
      {
        productIds,
        startDate: new Date().toISOString(),
      }
    );

    const availabilityForDate = result.find(
      (a) =>
        a.date.getFullYear() === targetFromTime.getFullYear() &&
        a.date.getMonth() === targetFromTime.getMonth() &&
        a.date.getDate() === targetFromTime.getDate()
    );

    const slotExists = availabilityForDate?.slots.some((slot) =>
      slot.products.some(
        (product) =>
          product.from.getTime() >= targetFromTime.getTime() &&
          product.to.getTime() <= targetToTime.getTime()
      )
    );

    expect(slotExists).toBeFalsy();
  });
});
