import { Customer } from "~/functions/customer";
import { Product } from "~/functions/product";
import { User } from "~/functions/user";

export enum BookingFulfillmentStatus {
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  FULFILLED = "fulfilled",
  BOOKED = "booked",
  DEFAULT = "default",
}

export type BaseBooking = {
  _id: string;
  productId: number;
  orderId: number;
  lineItemId: number;
  lineItemTotal: number;
  customerId: number;
  userId: string;
  end: Date;
  start: Date;
  anyAvailable?: boolean;
  fulfillmentStatus: BookingFulfillmentStatus;
  title: string;
  timeZone: string;
  isEdit?: boolean;
  isSelfBooked?: boolean;
};

export type Booking = BaseBooking & {
  customer: Customer;
  product: Product;
  user: User;
};

export type BookingServiceCreateProps = Pick<
  BaseBooking,
  "customerId" | "end" | "productId" | "userId" | "start"
>;

export type BookingServiceGetAllReturn = Booking;
export type BookingServiceGetAllProps = Pick<BaseBooking, "end" | "start"> & {
  userId?: string | string[];
};

export type BookingServiceUpdateQueryProps = Pick<BaseBooking, "_id">;

export type BookingServiceUpdateBodyProps = Pick<
  BaseBooking,
  "start" | "end" | "userId"
>;

export interface BookingServiceUpdateProps {
  query: BookingServiceUpdateQueryProps;
  body: BookingServiceUpdateBodyProps;
}

export type BookingServiceGetByIdReturn = Booking;
export type BookingServiceGetByIdProps = Pick<BaseBooking, "_id"> & {
  userId?: string | string[];
};
