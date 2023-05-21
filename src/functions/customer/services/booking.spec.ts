import { addDays, set } from "date-fns";
import { Booking, BookingModel } from "~/functions/booking";
import {
  CustomerBookingServiceGet,
  CustomerBookingServiceGetBooked,
  CustomerBookingServiceList,
} from "./booking";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerBookingService", () => {
  const booking1: Booking = {
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
        from: set(addDays(new Date(), 1), {
          hours: 11,
        }),
        to: set(addDays(new Date(), 1), {
          hours: 12,
        }),
        customerId: 1,
      },
      {
        lineItemId: 14551587717447,
        productId: 8022089564434,
        variantId: 46727192707399,
        title: "Dameklip i forb. med en behandling",
        priceSet: {
          amount: "0.00",
          currency_code: "DKK",
        },
        totalDiscountSet: {
          amount: "0.00",
          currency_code: "DKK",
        },
        from: set(addDays(new Date(), 1), {
          hours: 10,
        }),
        to: set(addDays(new Date(), 1), {
          hours: 11,
        }),
        customerId: 2,
      },
    ],
  };

  const booking2: Booking = {
    orderId: 560096751,
    cancelReason: "customer",
    cancelledAt: new Date(),
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
        from: set(addDays(new Date(), 2), {
          hours: 11,
        }),
        to: set(addDays(new Date(), 2), {
          hours: 12,
        }),
        customerId: 1,
      },
      {
        lineItemId: 14551587717447,
        productId: 8022089564434,
        variantId: 46727192707399,
        title: "Dameklip i forb. med en behandling",
        priceSet: {
          amount: "0.00",
          currency_code: "DKK",
        },
        totalDiscountSet: {
          amount: "0.00",
          currency_code: "DKK",
        },
        from: set(addDays(new Date(), 3), {
          hours: 11,
        }),
        to: set(addDays(new Date(), 3), {
          hours: 12,
        }),
        customerId: 1,
      },
    ],
  };

  const booking3: Booking = {
    orderId: 5967655751,
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
        from: set(addDays(new Date(), 4), {
          hours: 11,
        }),
        to: set(addDays(new Date(), 4), {
          hours: 12,
        }),
        status: "fulfilled",
        customerId: 1,
      },
      {
        lineItemId: 14551587717447,
        productId: 8022089564434,
        variantId: 46727192707399,
        title: "Dameklip i forb. med en behandling",
        priceSet: {
          amount: "0.00",
          currency_code: "DKK",
        },
        totalDiscountSet: {
          amount: "0.00",
          currency_code: "DKK",
        },
        from: set(addDays(new Date(), 5), {
          hours: 11,
        }),
        to: set(addDays(new Date(), 5), {
          hours: 12,
        }),
        customerId: 3,
      },
    ],
  };

  it("should return upcoming bookings for customer", async () => {
    await BookingModel.create(booking1);
    await BookingModel.create(booking2);
    await BookingModel.create(booking3);

    const customerId = 1;
    const bookings = await CustomerBookingServiceList({
      customerId,
      mode: "upcoming",
    });

    expect(bookings.length).toBe(1); // Assert the number of bookings

    // Iterate over the bookings and their lineItems
    for (const booking of bookings) {
      for (const lineItem of booking.lineItems) {
        // Assert the customerId in each lineItem
        expect(lineItem.customerId).toBe(customerId);
      }
    }
  });

  it("should return completed bookings for customer", async () => {
    await BookingModel.create(booking1);
    await BookingModel.create(booking2);
    await BookingModel.create(booking3);

    const customerId = 1;
    const bookings = await CustomerBookingServiceList({
      customerId,
      mode: "completed",
    });

    expect(bookings.length).toBe(3); // Assert the number of bookings

    // Iterate over the bookings and their lineItems
    for (const booking of bookings) {
      for (const lineItem of booking.lineItems) {
        // Assert the customerId in each lineItem
        expect(lineItem.customerId).toBe(customerId);
      }
    }
  });

  it("should return one booking", async () => {
    await BookingModel.create(booking2);

    const customerId = 1;
    const booking = await CustomerBookingServiceGet({
      customerId,
      orderId: booking2.orderId,
      date: booking2.lineItems[0].from,
    });

    expect(booking).toBeDefined();
    expect(booking.orderId).toEqual(560096751);
    expect(booking.buyer.id).toEqual(7106990342471);
    expect(booking.cancelReason).toEqual("customer");

    booking.lineItems.forEach((item) => {
      expect(item.customerId).toEqual(customerId);
      const expectedDate = booking2.lineItems[0].from
        .toISOString()
        .slice(0, 10);
      const actualDate = item.from.toISOString().slice(0, 10);

      expect(expectedDate).toEqual(actualDate);
    });
  });

  it("should return booked lineItems from booking", async () => {
    await BookingModel.create(booking1);
    await BookingModel.create(booking2);
    await BookingModel.create(booking3);

    const customerId = 1;
    const bookings = await CustomerBookingServiceGetBooked({
      customerId,
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
    });

    bookings.forEach((booking) => {
      expect(booking.from.getTime()).toBeGreaterThanOrEqual(
        new Date().getTime()
      );
      expect(booking.to.getTime()).toBeLessThanOrEqual(
        addDays(new Date(), 7).getTime()
      );

      // Optionally, you can also test that the 'from' date is less than or equal to the 'to' date for each booking
      expect(booking.from.getTime()).toBeLessThanOrEqual(booking.to.getTime());
    });
  });
});
