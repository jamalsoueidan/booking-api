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
import { Shift, ShiftDaysInterval, Tag } from "./shift.types";

// for single shift, not in group
type ShiftBody = Pick<Shift, "tag" | "start" | "end">;

type ShiftServiceGetAllProps = Pick<Shift, "userId" | "start" | "end">;

export const ShiftServiceGetAll = ({
  userId,
  start,
  end,
}: ShiftServiceGetAllProps) => {
  return ShiftModel.find({
    end: {
      $lt: DateHelpers.closeOfDay(end),
    },
    userId: new mongoose.Types.ObjectId(userId),
    start: {
      $gte: DateHelpers.beginningOfDay(start),
    },
  });
};

export type ShiftServiceCreateQueryProps = Pick<Shift, "userId">;
export type ShiftServiceCreateBodyProps = ShiftBody;

export const ShiftServiceCreate = async (
  query: ShiftServiceCreateQueryProps,
  body: ShiftServiceCreateBodyProps
) => {
  return ShiftModel.create({
    end: resetTime(body.end),
    userId: query.userId,
    start: resetTime(body.start),
    tag: body.tag,
  });
};

type ShiftServiceUpdateProps = {
  _id: string;
  userId: string;
};

type ShiftServiceUpdateBodyProps = Omit<ShiftBody, "tag">;

export const ShiftServiceUpdate = (
  { _id, userId }: ShiftServiceUpdateProps,
  body: ShiftServiceUpdateBodyProps
) => {
  return ShiftModel.findOneAndUpdate(
    { _id, userId },
    {
      end: resetTime(body.end),
      start: resetTime(body.start),
    },
    {
      returnOriginal: false,
    }
  );
};

type ShiftServiceDestroyProps = Pick<Shift, "_id" | "userId">;

export const ShiftServiceDestroy = async ({
  _id,
  userId,
}: ShiftServiceDestroyProps) => {
  return ShiftModel.deleteOne({ _id, userId });
};

type ShiftServiceGetGroupProps = {
  groupId: string;
  userId: string;
};

type ShiftServiceGetGroupBody = ShiftBody & {
  userId: string;
  days: Array<ShiftDaysInterval>;
  groupId: string;
};

export const ShiftServiceGetGroup = async (
  query: ShiftServiceGetGroupProps
) => {
  const shifts = await ShiftModel.find(query).sort({ start: "asc" }); // sort is important to generate the body for editing group
  return shifts.reduce<ShiftServiceGetGroupBody>(
    (body: ShiftServiceGetGroupBody, shift: IShift, currentIndex: number) => {
      const day = format(
        shift.start,
        "EEEE"
      ).toLowerCase() as ShiftDaysInterval;
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
      if (shift.groupId) {
        body.groupId = shift.groupId;
      }

      body.userId = shift.userId.toString();
      return body;
    },
    {
      days: [],
      end: new Date(),
      start: new Date(),
      tag: Tag.all_day,
      groupId: "",
      userId: "",
    }
  );
};

type ShiftServiceCreateGroupQuery = {
  userId: string;
};

type ShiftServiceGroupBody = ShiftBody & {
  days: Array<ShiftDaysInterval>;
};

export const ShiftServiceCreateGroup = async (
  query: ShiftServiceCreateGroupQuery,
  body: ShiftServiceGroupBody
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
  return ShiftModel.find({ userId, groupId });
};

type ShiftServiceUpdateGroupQueryProps = ShiftServiceGetGroupProps;
type ShiftServiceUpdateGroupBodyProps = ShiftServiceGroupBody;

export const ShiftServiceUpdateGroup = async (
  query: ShiftServiceUpdateGroupQueryProps,
  body: ShiftServiceUpdateGroupBodyProps
) => {
  await ShiftServiceDestroyGroup(query);
  return ShiftServiceCreateGroup(query, body);
};

type ShiftServiceDestroyGroupProps = {
  groupId: string;
  userId: string;
};

export const ShiftServiceDestroyGroup = async (
  query: ShiftServiceDestroyGroupProps
) => {
  return ShiftModel.deleteMany(query);
};
