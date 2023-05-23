import { Booking, BookingMode, BookingModel } from "~/functions/booking";
import { Schedule } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type CustomerBookingServiceListProps = {
  customerId: Schedule["customerId"];
  mode: BookingMode;
};

export const CustomerBookingServiceList = ({
  customerId,
  mode,
}: CustomerBookingServiceListProps) => {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const $upcoming = {
    $and: [
      { "lineItems.from": { $gte: todayStart } },
      { "lineItems.status": { $in: ["unfulfilled", "onhold"] } },
      { cancelledAt: { $eq: null } },
    ],
  };

  const $completed = {
    $or: [
      { "lineItems.from": { $lte: todayEnd } },
      { "lineItems.status": { $nin: ["unfulfilled", "onhold"] } },
      { cancelledAt: { $exists: true, $ne: null } },
    ],
  };

  return BookingModel.aggregate<Booking>([
    { $unwind: "$lineItems" },
    {
      $match: {
        "lineItems.customerId": customerId,
        ...(mode === "upcoming" ? $upcoming : $completed),
      },
    },
    // OR cancelled? status == or cancelledAt ???
    {
      $group: {
        _id: {
          bookingId: "$_id",
          fromDay: { $dayOfYear: "$lineItems.from" },
        },
        orderId: { $first: "$orderId" },
        buyer: { $first: "$buyer" },
        customer: { $first: "$customer" },
        cancelReason: { $first: "$cancelReason" },
        cancelledAt: { $first: "$cancelledAt" },
        lineItems: { $push: "$lineItems" },
      },
    },
    { $sort: { "lineItems.from": 1 } },
  ]);
};

export type CustomerBookingServiceGetProps = {
  customerId: Schedule["customerId"];
  orderId: number;
  date: Date;
};

export const CustomerBookingServiceGet = async ({
  customerId,
  orderId,
  date,
}: CustomerBookingServiceGetProps) => {
  date.setUTCHours(0, 0, 0, 0);
  const bookings = await BookingModel.aggregate<Booking>([
    { $unwind: "$lineItems" },
    {
      $addFields: {
        fromDateOnly: {
          $dateFromParts: {
            year: { $year: "$lineItems.from" },
            month: { $month: "$lineItems.from" },
            day: { $dayOfMonth: "$lineItems.from" },
          },
        },
      },
    },
    {
      $match: {
        "lineItems.customerId": customerId,
        orderId,
        fromDateOnly: date,
      },
    },
    {
      $group: {
        _id: { orderId: "$orderId", fromDate: "$fromDateOnly" },
        buyer: { $first: "$buyer" },
        lineItems: { $push: "$lineItems" },
        cancelReason: { $first: "$cancelReason" },
        cancelledAt: { $first: "$cancelledAt" },
      },
    },
    {
      $project: {
        _id: 0,
        orderId: "$_id.orderId",
        fromDay: "$_id.fromDate",
        buyer: 1,
        lineItems: 1,
        cancelReason: 1,
        cancelledAt: 1,
      },
    },
  ]);

  if (bookings.length > 0) {
    return bookings[0];
  }

  throw new NotFoundError([
    {
      code: "custom",
      message: "BOOKING_NOT_FOUND",
      path: ["orderId"],
    },
  ]);
};

export type CustomerBookingServiceGetBookedProps = {
  customerId: Schedule["customerId"];
  startDate: Date;
  endDate: Date;
};

export const CustomerBookingServiceGetBooked = async ({
  customerId,
  startDate,
  endDate,
}: CustomerBookingServiceGetBookedProps) => {
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);
  return BookingModel.aggregate<{ from: Date; to: Date }>([
    // Filter the documents
    {
      $match: {
        "lineItems.customerId": customerId,
        "lineItems.from": {
          $gte: startDate,
        },
        "lineItems.to": {
          $lte: endDate,
        },
      },
    },
    // Unwind the lineItems array
    {
      $unwind: "$lineItems",
    },
    // Apply the filter on lineItems
    {
      $match: {
        "lineItems.customerId": customerId,
        "lineItems.from": {
          $gte: startDate,
        },
        "lineItems.to": {
          $lte: endDate,
        },
      },
    },
    // Select only the required fields
    {
      $project: {
        from: "$lineItems.from",
        to: "$lineItems.to",
        _id: 0,
      },
    },
  ]);
};
