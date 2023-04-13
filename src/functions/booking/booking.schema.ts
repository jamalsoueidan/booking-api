import { Document, Model, Schema, Types } from "mongoose";
import { Booking, BookingFulfillmentStatus } from "./booking.types";

export interface IBooking extends Omit<Booking, "_id" | "userId"> {
  userId: Types.ObjectId;
}

export interface IBookingDocument extends IBooking, Document {}

export interface IBookingModel extends Model<IBookingDocument> {}

export const BookingMongooseSchema = new Schema<
  IBookingDocument,
  IBookingModel
>({
  anyAvailable: {
    default: false,
    type: Boolean,
  },
  customerId: Number,
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
  isEdit: {
    default: false,
    type: Boolean,
  },
  isSelfBooked: {
    default: false,
    type: Boolean,
  },
  lineItemId: {
    index: true,
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
  productId: Number,
  userId: {
    ref: "user",
    required: true,
    type: Schema.Types.ObjectId,
  },
  start: {
    index: true,
    required: true,
    type: Date,
  },
  timeZone: String,
  title: String,
});
