import { Document, Model, Schema } from "mongoose";
import { Booking, BookingFulfillmentStatus } from "./booking.types";

export interface IBooking extends Omit<Booking, "_id"> {}

export interface IBookingDocument extends IBooking, Document {}

export interface IBookingModel extends Model<IBookingDocument> {}

export const BookingMongooseSchema = new Schema<
  IBookingDocument,
  IBookingModel
>({
  productId: {
    type: Number,
    index: true,
  },
  customerId: {
    type: Number,
    index: true,
  },
  end: {
    index: true,
    required: true,
    type: Date,
  },
  fulfillmentStatus: {
    default: BookingFulfillmentStatus.DEFAULT,
    enum: Object.values(BookingFulfillmentStatus),
    index: true,
    type: String,
  },
  lineItemId: {
    type: Number,
    unqiue: true,
  },
  lineItemTotal: {
    default: 1,
    type: Number,
  },
  orderId: {
    index: true,
    type: Number,
  },
  start: {
    required: true,
    type: Date,
  },
});
