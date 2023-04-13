import { faker } from "@faker-js/faker";
import { setHours } from "date-fns";
import { BookingModel } from "~/functions/booking";
import { createCustomer } from "./customer";
import { DEFAULT_GROUP, createUser } from "./user";

type CreateStaffWithBookingProps = {
  productId: number;
  group?: string;
};

export const createUserWithBooking = async ({
  productId,
  group = DEFAULT_GROUP,
}: CreateStaffWithBookingProps) => {
  const user = await createUser({ group });

  const booking = await createBooking({
    productId,
    userId: user._id,
  });

  return { booking, user };
};

type CreateBookingProps = {
  productId: number;
  userId: string;
  start?: Date;
  end?: Date;
};

export const createBooking = async ({
  productId,
  userId,
  start = setHours(new Date(), 15),
  end = setHours(new Date(), 16),
}: CreateBookingProps) => {
  const customer = await createCustomer();
  return BookingModel.create({
    customerId: customer.customerId,
    end,
    fulfillmentStatus: "refunded",
    lineItemId: 1100,
    lineItemTotal: 1,
    orderId: 1000,
    productId,
    userId,
    start,
    title: faker.company.name(),
  });
};
