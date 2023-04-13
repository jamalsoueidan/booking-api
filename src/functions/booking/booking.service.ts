import mongoose from "mongoose";
import { ProductModel } from "~/functions/product";
import { NotFoundError } from "~/library/handler";
import { DateHelpers } from "~/library/helper-date";
import { BookingModel } from "./booking.model";
import {
  Booking,
  BookingServiceCreateProps,
  BookingWithLookup,
} from "./booking.types";

export const BookingServiceCreate = async (body: BookingServiceCreateProps) => {
  const product = await ProductModel.findOne({
    productId: body.productId,
  }).lean();

  if (!product) {
    throw new NotFoundError("no product found");
  }

  const booking = await BookingModel.create({
    ...body,
    fulfillmentStatus: "booked",
    isSelfBooked: true,
    lineItemId: Date.now() + Math.floor(100000 + Math.random() * 900000),
    lineItemTotal: 1,
    orderId: Date.now() + Math.floor(100000 + Math.random() * 900000),
    title: product.title,
  });

  /*await NotificationServiceSendBookingConfirmationCustomer({
      booking,
    });

    await NotificationServiceSendBookingReminderUser({
      bookings: [booking],
    });

    await NotificationServiceSendBookingReminderCustomer({
      bookings: [booking],
    });*/

  return booking;
};

export const BookingServiceFind = async () => {
  return BookingModel.find();
};

type BookingServiceGetAllProps = Pick<Booking, "end" | "start"> & {
  userId?: string | string[];
};

export const BookingServiceGetAll = ({
  start,
  end,
  userId,
}: BookingServiceGetAllProps) =>
  BookingModel.aggregate<BookingWithLookup>([
    {
      $match: {
        end: {
          $lt: DateHelpers.closeOfDay(end),
        },
        start: {
          $gte: DateHelpers.beginningOfDay(start),
        },
        ...(Array.isArray(userId) && {
          userId: { $in: userId.map((s) => new mongoose.Types.ObjectId(s)) },
        }),
        ...(userId &&
          !Array.isArray(userId) && {
            userId: new mongoose.Types.ObjectId(userId),
          }),
      },
    },
    ...lookup,
  ]);

type BookingServiceUpdateQuery = Pick<Booking, "_id">;

type BookingServiceUpdateBody = Pick<Booking, "start" | "end" | "userId">;

export const BookingServiceUpdate = async (
  query: BookingServiceUpdateQuery,
  body: BookingServiceUpdateBody
) => {
  const booking = await BookingModel.findOne(query);
  if (!booking) {
    throw new Error("Not found");
  }
  booking.userId = new mongoose.Types.ObjectId(body.userId);
  booking.start = new Date(body.start);
  booking.end = new Date(body.end);
  booking.isEdit = true;

  /*
  await NotificationServiceCancelAll({
    lineItemId: booking.lineItemId,
    orderId: booking.orderId,
    shop,
  });

  await NotifcationServiceSendBookingUpdateCustomer({
    booking,
    shop,
  });

  await NotificationServiceSendBookingReminderUser({
    bookings: [booking],
    shop,
  });

  await NotificationServiceSendBookingReminderCustomer({
    bookings: [booking],
    shop,
  });*/

  return booking.save();
};

export type BookingServiceGetByIdProps = Pick<Booking, "_id"> & {
  userId?: string | string[];
};

export const BookingServiceGetById = async ({
  _id,
  userId,
}: BookingServiceGetByIdProps) => {
  const bookings = await BookingModel.aggregate<BookingWithLookup>([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(_id),
        ...(Array.isArray(userId) && {
          userId: { $in: userId.map((s) => new mongoose.Types.ObjectId(s)) },
        }),
        ...(typeof userId === "string" && {
          userId: new mongoose.Types.ObjectId(userId),
        }),
      },
    },
    ...lookup,
  ]);

  return bookings.length > 0 ? bookings[0] : null;
};

/* Can't be added to BookingSchema.pre("aggregate", function (next) {
  Because Widget also use BookingModel.aggreate, and don't need relation
  */
const lookup = [
  {
    $lookup: {
      as: "customer",
      foreignField: "customerId",
      from: "Customer",
      localField: "customerId",
    },
  },
  {
    $unwind: {
      path: "$customer",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      as: "user",
      foreignField: "_id",
      from: "User",
      localField: "userId",
    },
  },
  {
    $unwind: {
      path: "$user",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      as: "product",
      foreignField: "productId",
      from: "Product",
      localField: "productId",
    },
  },
  {
    $unwind: {
      path: "$product",
      preserveNullAndEmptyArrays: true,
    },
  },
];
