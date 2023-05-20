import { Booking, BookingModel } from "~/functions/booking";
import { TimeUnit } from "~/functions/schedule";
import { ScheduleModel } from "~/functions/schedule/schedule.model";
import { CustomerProductAvailabilityService } from "./availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductAvailabilityService", () => {
  const schedule1 = {
    name: "another",
    customerId: 1,
    slots: [
      {
        day: "tuesday",
        intervals: [
          {
            to: "11:00",
            from: "09:00",
          },
        ],
      },
    ],
    products: [
      {
        productId: 12,
        duration: 45,
        breakTime: 15,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.DAYS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
    ],
  };

  let schedule2 = {
    name: "DEFAULT",
    customerId: 1,
    slots: [
      {
        day: "monday",
        intervals: [
          {
            to: "12:00",
            from: "08:00",
          },
        ],
      },
      {
        day: "tuesday",
        intervals: [
          {
            to: "12:00",
            from: "08:00",
          },
        ],
      },
    ],
    products: [
      {
        productId: 43,
        duration: 30,
        breakTime: 5,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.DAYS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
      {
        productId: 8022089597202,
        duration: 30,
        breakTime: 15,
        noticePeriod: {
          value: 1,
          unit: TimeUnit.HOURS,
        },
        bookingPeriod: {
          value: 4,
          unit: TimeUnit.WEEKS,
        },
      },
      {
        productId: 8022088745234,
        duration: 30,
        breakTime: 15,
        noticePeriod: {
          value: 6,
          unit: TimeUnit.DAYS,
        },
        bookingPeriod: {
          value: 2,
          unit: TimeUnit.WEEKS,
        },
      },
    ],
  };

  it("should return available slots for the given date range and product", async () => {
    await ScheduleModel.create(schedule2);
    await ScheduleModel.create(schedule1);

    let result = await CustomerProductAvailabilityService({
      customerId: 1,
      productIds: [8022089597202, 8022088745234],
      startDate: new Date().toISOString(),
    });
  });

  it("should return available slots and removed booked slots", async () => {
    await ScheduleModel.create(schedule2);
    await ScheduleModel.create(schedule1);

    let result = await CustomerProductAvailabilityService({
      customerId: 1,
      productIds: [8022089597202, 8022088745234],
      startDate: "2022-12-12",
    });

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
          productId: 8022088646930,
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

    result = await CustomerProductAvailabilityService({
      customerId: 1,
      productIds: [8022089597202, 8022088745234],
      startDate: new Date().toISOString(),
    });

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

    expect(slotExists).toBeUndefined();
  });
});
