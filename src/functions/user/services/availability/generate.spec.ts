import {
  addDays,
  differenceInMinutes,
  format,
  isWithinInterval,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Booking, BookingModel } from "~/functions/booking";
import { LocationTypes } from "~/functions/location";

import { faker } from "@faker-js/faker";
import { WeekDays } from "~/functions/schedule";
import { ShippingModel } from "~/functions/shipping/shipping.model";
import { arrayElements, createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getLocationObject,
} from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { UserAvailabilityServiceGenerate } from "./generate";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserAvailabilityServiceGenerate", () => {
  const customerId = 1;
  let user: Awaited<ReturnType<typeof createUser>>;
  let schedule: Awaited<ReturnType<typeof createSchedule>>;
  let locationOrigin: Awaited<ReturnType<typeof createLocation>>;
  let locationDestination: Awaited<ReturnType<typeof createLocation>>;

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

    locationOrigin = await createLocation({
      customerId,
      locationType: LocationTypes.ORIGIN,
    });

    locationDestination = await createLocation({
      customerId,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      locationType: LocationTypes.DESTINATION,
    });

    schedule = await createSchedule(
      { customerId },
      {
        totalProducts: 2,
        days,
        locations: [
          {
            location: locationOrigin._id,
            locationType: locationOrigin.locationType,
          },
          {
            location: locationDestination._id,
            locationType: locationDestination.locationType,
          },
        ],
      }
    );
  });

  it("should calculate destination in available slots", async () => {
    const shipping = await ShippingModel.create({
      location: locationDestination._id,
      origin: getLocationObject(),
      destination: {
        name: faker.person.firstName(),
        fullAddress: faker.location.streetAddress(),
      },
      duration: {
        text: "14 mins",
        value: faker.helpers.arrayElement([15, 30, 45]),
      },
      distance: { text: "5.3 km", value: 5342 },
      cost: 40,
    });

    const productIds = arrayElements(schedule.products, 2).map(
      (product) => product.productId
    );

    const result = await UserAvailabilityServiceGenerate(
      {
        username: user.username!,
        locationId: locationDestination._id,
      },
      {
        productIds,
        fromDate: new Date().toISOString(),
        shippingId: shipping._id,
      }
    );
  });

  it("should return available slots for the given date range and product", async () => {
    const productIds = arrayElements(schedule.products, 2).map(
      (product) => product.productId
    );

    const result = await UserAvailabilityServiceGenerate(
      {
        username: user.username!,
        locationId: locationOrigin._id,
      },
      {
        productIds,
        fromDate: new Date().toISOString(),
      }
    );

    const interval = {
      start: new Date(`1970-01-01T${schedule.slots[0].intervals[0].from}:00Z`),
      end: new Date(`1970-01-01T${schedule.slots[0].intervals[0].to}:00Z`),
    };

    result.forEach((item) => {
      // All items is either one of the weekDays I have, no other weekdays.
      const day = format(
        utcToZonedTime(new Date(item.date), "Etc/UTC"),
        "iiii"
      ).toLowerCase();
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

    let result = await UserAvailabilityServiceGenerate(
      {
        username: user.username!,
        locationId: locationOrigin._id,
      },
      { productIds, fromDate: new Date().toISOString() }
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

    result = await UserAvailabilityServiceGenerate(
      {
        username: user.username!,
        locationId: locationOrigin._id,
      },
      {
        productIds,
        fromDate: new Date().toISOString(),
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