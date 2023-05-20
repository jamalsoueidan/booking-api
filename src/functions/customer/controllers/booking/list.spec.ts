import { HttpRequest, InvocationContext } from "@azure/functions";
import { addDays, set } from "date-fns";
import { Booking, BookingModel } from "~/functions/booking";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerBookingControllerList,
  CustomerBookingControllerListRequest,
  CustomerBookingControllerListResponse,
} from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerBookingControllerList", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

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
        status: "completed",
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

  it("Should be able to get all upcoming bookings for customer", async () => {
    await BookingModel.create(booking1);
    await BookingModel.create(booking2);
    await BookingModel.create(booking3);
    request = await createHttpRequest<CustomerBookingControllerListRequest>({
      query: {
        customerId: 1,
        mode: "upcoming",
      },
    });

    const res: HttpSuccessResponse<CustomerBookingControllerListResponse> =
      await CustomerBookingControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toHaveLength(1);
  });

  it("Should be able to get all completed bookings for customer", async () => {
    await BookingModel.create(booking1);
    await BookingModel.create(booking2);
    await BookingModel.create(booking3);
    request = await createHttpRequest<CustomerBookingControllerListRequest>({
      query: {
        customerId: 1,
        mode: "completed",
      },
    });

    const res: HttpSuccessResponse<CustomerBookingControllerListResponse> =
      await CustomerBookingControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toHaveLength(3);
  });
});
