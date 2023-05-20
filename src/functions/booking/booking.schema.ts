import { Document, Model, Schema } from "mongoose";
import { Booking } from "./booking.types";

export interface IBooking extends Omit<Booking, "_id"> {}

export interface IBookingDocument extends IBooking, Document {}

export interface IBookingModel extends Model<IBookingDocument> {}

const LineItemSchema = new Schema(
  {
    lineItemId: Number,
    productId: {
      type: Number,
      index: true,
    },
    variantId: {
      type: Number,
      index: true,
    },
    title: String,
    priceSet: {
      amount: String,
      currency_code: String, // keep it underscore
    },
    totalDiscountSet: {
      amount: String,
      currency_code: String, // keep it underscore
    },
    from: {
      type: Date,
      index: true,
    },
    to: {
      type: Date,
      index: true,
    },
    customerId: {
      type: Number,
      index: true,
    },
    status: {
      type: String,
      enum: ["unfulfilled", "cancelled", "completed"],
      required: true,
      default: "unfulfilled",
    },
  },
  { _id: false, timestamps: true }
);

const BuyerSchema = new Schema(
  {
    id: {
      type: Number,
      index: true,
    },
    fullName: String,
    phone: String,
    email: String,
  },
  { _id: false, timestamps: true }
);

export const BookingMongooseSchema = new Schema<
  IBookingDocument,
  IBookingModel
>(
  {
    orderId: {
      type: Number,
      index: true,
      unique: true,
    },
    cancelReason: String,
    cancelledAt: Date,
    buyer: BuyerSchema,
    lineItems: [LineItemSchema],
  },
  { timestamps: true }
);
