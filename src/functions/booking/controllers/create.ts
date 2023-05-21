import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { connect } from "../../../library/mongoose";
import { BookingModel } from "../booking.model";
import { Booking } from "../booking.types";

export async function BookingControllerCreate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  await connect();
  const response = (await request.json()) as { order: Booking };
  const booking = new BookingModel(response.order);
  const order = await booking.save();
  return { jsonBody: order };
}
