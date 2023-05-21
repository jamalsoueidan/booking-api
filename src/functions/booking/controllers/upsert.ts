import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { connect } from "../../../library/mongoose";
import { BookingServiceUpsert } from "../booking.service";
import { Booking } from "../booking.types";

export async function BookingControllerUpsert(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(
    `Http function processed request for url "${request.url}" ${request.method}`
  );
  await connect();
  const response = (await request.json()) as { order: Booking };
  return { jsonBody: BookingServiceUpsert(response.order) };
}
