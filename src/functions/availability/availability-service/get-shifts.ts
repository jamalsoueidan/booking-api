import { ShiftModel, Tag } from "~/functions/shift";
import { DateHelpers } from "~/library/helper-date";
import { AvailabilityHourUser } from "../availability.types";

export type AvailabilityServiceGetShiftsProps = {
  start: Date;
  end: Date;
  userIds: string[];
  tag: Tag[];
};

export type AvailabilityServiceGetShiftsReturn = {
  start: Date;
  end: Date;
  tag: Tag;
} & AvailabilityHourUser;

export const AvailabilityServiceGetShifts = ({
  tag,
  userIds,
  start,
  end,
}: AvailabilityServiceGetShiftsProps) => {
  return ShiftModel.aggregate<AvailabilityServiceGetShiftsReturn>([
    {
      $match: {
        end: {
          $lt: DateHelpers.closeOfDay(end),
        },
        userId: {
          $in: userIds,
        },
        start: {
          $gte: DateHelpers.beginningOfDay(start),
        },
        tag: {
          $in: tag,
        },
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
      },
    },
    {
      $match: {
        "user.active": true,
      },
    },
    {
      $project: {
        "user.__v": 0,
        "user.active": 0,
        "user.avatar": 0,
        "user.email": 0,
        "user.phone": 0,
        "user.position": 0,
        "user.shop": 0,
      },
    },
  ]);
};
