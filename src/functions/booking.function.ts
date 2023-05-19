import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { BookingModel } from "./booking/booking.model";
import { Booking } from "./booking/booking.types";

export async function bookingNewPost(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const response = (await request.json()) as { order: Booking };

  const booking = new BookingModel(response.order);
  return { jsonBody: booking.save() };
}

app.http("bookingNewPost", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "booking/{orderId?}",
  handler: bookingNewPost,
});

export async function bookingUpdate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const response = (await request.json()) as { order: Booking };
  // Update buyer
  await BookingModel.updateOne(
    { orderId: response.order.orderId },
    { $set: { buyer: response.order.buyer } }
  );

  // Update each line item
  for (const lineItem of response.order.lineItems) {
    await BookingModel.updateOne(
      {
        orderId: response.order.orderId,
        "lineItems.lineItemId": lineItem.lineItemId,
      },
      { $set: { "lineItems.$.status": lineItem.status } }
    );
  }

  const updatedBooking = await BookingModel.findOne({
    orderId: response.order.orderId,
  });

  return { jsonBody: updatedBooking };
}

app.http("bookingUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "booking/{orderId?}",
  handler: bookingUpdate,
});
