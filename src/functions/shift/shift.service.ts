import { format } from "date-fns";
import mongoose from "mongoose";
import { DateHelpers } from "~/library/helper-date";
import {
  createDateTime,
  getDaysFromRange,
  handleWinterSummerTime,
  resetTime,
} from "./shift.helper";
import { ShiftModel } from "./shift.model";
import { IShift } from "./shift.schema";
import {
  ShiftServiceCreateGroupBodyProps,
  ShiftServiceCreateGroupProps,
  ShiftServiceCreateProps,
  ShiftServiceDaysInterval,
  ShiftServiceDestroyGroupProps,
  ShiftServiceDestroyGroupReturn,
  ShiftServiceDestroyProps,
  ShiftServiceDestroyReturn,
  ShiftServiceGetAllProps,
  ShiftServiceGetGroupProps,
  ShiftServiceGetGroupReturn,
  ShiftServiceUpdateGroupBodyProps,
  ShiftServiceUpdateGroupQueryProps,
  ShiftServiceUpdateProps,
  Tag,
} from "./shift.types";

export const ShiftServiceGetAll = ({
  userId,
  start,
  end,
}: ShiftServiceGetAllProps) =>
  ShiftModel.find({
    end: {
      $lt: DateHelpers.closeOfDay(end),
    },
    userId: new mongoose.Types.ObjectId(userId),
    start: {
      $gte: DateHelpers.beginningOfDay(start),
    },
  });

export const ShiftServiceCreate = async (
  query: ShiftServiceCreateProps["query"],
  body: ShiftServiceCreateProps["body"]
) =>
  ShiftModel.create({
    end: resetTime(body.end),
    userId: query.userId,
    start: resetTime(body.start),
    tag: body.tag,
  });

export const ShiftServiceUpdate = (
  { shift: _id, userId }: ShiftServiceUpdateProps["query"],
  body: ShiftServiceUpdateProps["body"]
) =>
  ShiftModel.findOneAndUpdate(
    { _id, userId },
    {
      end: resetTime(body.end),
      start: resetTime(body.start),
    },
    {
      returnOriginal: false,
    }
  );

export const ShiftServiceDestroy = async ({
  shift,
  userId,
}: ShiftServiceDestroyProps): Promise<ShiftServiceDestroyReturn> =>
  ShiftModel.deleteOne({ _id: shift, userId });

export const ShiftServiceGetGroup = async (
  query: ShiftServiceGetGroupProps
) => {
  const shifts = await ShiftModel.find(query).sort({ start: "asc" }); // sort is important to generate the body for editing group
  return shifts.reduce<ShiftServiceGetGroupReturn>(
    (
      body: ShiftServiceCreateGroupBodyProps,
      shift: IShift,
      currentIndex: number
    ) => {
      const day = format(
        shift.start,
        "EEEE"
      ).toLowerCase() as ShiftServiceDaysInterval;
      if (!body.days.includes(day)) {
        body.days.push(day);
      }
      if (currentIndex === 0) {
        // eslint-disable-next-line no-param-reassign
        body.start = shift.start;
        // eslint-disable-next-line no-param-reassign
        body.tag = shift.tag;
      }

      if (currentIndex + 1 === shifts.length) {
        // eslint-disable-next-line no-param-reassign
        body.end = shift.end;
      }
      return body;
    },
    { days: [], end: new Date(), start: new Date(), tag: Tag.all_day }
  );
};

export const ShiftServiceCreateGroup = async (
  query: ShiftServiceCreateGroupProps["query"],
  body: ShiftServiceCreateGroupProps["body"]
) => {
  const { userId } = query;
  const groupId = new Date().getTime().toString();
  const daysSelected = getDaysFromRange(body.days, body);
  const shifts = handleWinterSummerTime(
    body,
    daysSelected.map((date) => ({
      end: createDateTime(date, body.end),
      groupId,
      userId,
      start: createDateTime(date, body.start),
      tag: body.tag,
    }))
  );

  await ShiftModel.insertMany(shifts);
  return shifts;
};

export const ShiftServiceUpdateGroup = async (
  query: ShiftServiceUpdateGroupQueryProps,
  body: ShiftServiceUpdateGroupBodyProps
) => {
  await ShiftServiceDestroyGroup(query);
  return ShiftServiceCreateGroup(query, body);
};

export const ShiftServiceDestroyGroup = async (
  query: ShiftServiceDestroyGroupProps
): Promise<ShiftServiceDestroyGroupReturn> => {
  const { userId, groupId } = query;
  return ShiftModel.deleteMany({ groupId, userId });
};
