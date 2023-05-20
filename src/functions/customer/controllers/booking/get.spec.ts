import { HttpRequest, InvocationContext } from "@azure/functions";
import { addDays, set } from "date-fns";
import { Booking, BookingModel } from "~/functions/booking";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerBookingControllerGet,
  CustomerBookingControllerGetRequest,
  CustomerBookingControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerBookingControllerGet", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

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

  it("Should be able to get user by username", async () => {
    await BookingModel.create(booking2);
    request = await createHttpRequest<CustomerBookingControllerGetRequest>({
      query: {
        customerId: 1,
        orderId: booking2.orderId,
        date: booking2.lineItems[0].from,
      },
    });

    const res: HttpSuccessResponse<CustomerBookingControllerGetResponse> =
      await CustomerBookingControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.orderId).toEqual(560096751);
    expect(res.jsonBody?.payload.buyer.id).toEqual(7106990342471);
    expect(res.jsonBody?.payload.cancelReason).toEqual("customer");
  });
});
