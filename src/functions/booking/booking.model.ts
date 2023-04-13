import { model } from "mongoose";
import {
  BookingMongooseSchema,
  IBookingDocument,
  IBookingModel,
} from "./booking.schema";

export const BookingModel = model<IBookingDocument, IBookingModel>(
  "booking",
  BookingMongooseSchema,
  "Booking"
);
