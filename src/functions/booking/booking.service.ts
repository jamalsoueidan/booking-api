import mongoose from "mongoose";
import { ProductModel } from "~/functions/product";
import { DateHelpers } from "~/library/helper-date";
import { BookingModel } from "./booking.model";
import {
  BookingServiceCreateProps,
  BookingServiceGetAllProps,
  BookingServiceGetAllReturn,
  BookingServiceGetByIdProps,
  BookingServiceGetByIdReturn,
  BookingServiceUpdateBodyProps,
  BookingServiceUpdateQueryProps,
} from "./booking.types";

export const BookingServiceCreate = async (body: BookingServiceCreateProps) => {
  const product = await ProductModel.findOne({
    productId: body.productId,
  }).lean();

  if (product) {
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
  }
  throw new Error("no product found");
};

export const BookingServiceFind = async () => {
  return BookingModel.find();
};

export const BookingServiceGetAll = ({
  start,
  end,
  userId,
}: BookingServiceGetAllProps) =>
  BookingModel.aggregate<BookingServiceGetAllReturn>([
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

export const BookingServiceUpdate = async (
  query: BookingServiceUpdateQueryProps,
  body: BookingServiceUpdateBodyProps
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

export const BookingServiceGetById = async ({
  _id,
  userId,
}: BookingServiceGetByIdProps) => {
  const bookings = await BookingModel.aggregate<BookingServiceGetByIdReturn>([
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
