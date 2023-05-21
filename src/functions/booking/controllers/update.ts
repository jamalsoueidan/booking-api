import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { connect } from "../../../library/mongoose";
import { BookingModel } from "../booking.model";
import { Booking } from "../booking.types";

export async function BookingControllerUpdate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  await connect();
  const response = (await request.json()) as { order: Booking };
  // Update buyer
  await BookingModel.updateOne(
    { orderId: response.order.orderId },
    {
      $set: {
        buyer: response.order.buyer,
        cancelledAt: response.order.cancelledAt,
        cancelReason: response.order.cancelReason,
      },
    }
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
