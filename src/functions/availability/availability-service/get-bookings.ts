import { Booking, BookingModel } from "~/functions/booking";
import { DateHelpers } from "~/library/helper-date";

export interface GetBookingsByUserProps {
  start: Date;
  end: Date;
  userIds: string[];
}

export const AvailabilityServiceGetBookings = ({
  start,
  end,
  userIds,
}: GetBookingsByUserProps) => {
  return BookingModel.aggregate<Booking>([
    {
      $match: {
        $or: [
          {
            start: {
              $gte: DateHelpers.beginningOfDay(start),
            },
          },
          {
            end: {
              $gte: DateHelpers.beginningOfDay(start),
            },
          },
        ],
        userId: {
          $in: userIds,
        },
      },
    },
    {
      $match: {
        $or: [
          {
            start: {
              $lt: DateHelpers.closeOfDay(end),
            },
          },
          {
            end: {
              $lt: DateHelpers.closeOfDay(end),
            },
          },
        ],
      },
    },
    /*{
      remove all unnessary fields
      $project: {
        _id: 0,
        productId: 0,
        shop: 0,
      },
    },*/
  ]);
};
