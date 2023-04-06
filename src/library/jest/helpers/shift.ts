import { addHours, addWeeks, set, setHours } from "date-fns";
import { AuthRole } from "~/functions/auth";
import {
  ShiftServiceCreate,
  ShiftServiceCreateBodyProps,
  ShiftServiceCreateGroup,
  ShiftServiceCreateQueryProps,
} from "~/functions/shift";
import { Tag } from "~/functions/shift/shift.types";
import { DEFAULT_GROUP, createUser } from "./user";

type PartialRequired<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;

const resetTime = (date: Date) =>
  set(date, { minutes: 0, seconds: 0, milliseconds: 0 });

export const createShift = async ({
  userId,
  tag,
  start = resetTime(new Date()),
  end = resetTime(addHours(new Date(), 5)),
}: ShiftServiceCreateQueryProps &
  PartialRequired<ShiftServiceCreateBodyProps, "tag">) => {
  return ShiftServiceCreate(
    { userId },
    {
      end,
      start,
      tag,
    }
  );
};

interface CreateUserWithShiftProps {
  tag: Tag;
  group?: string;
  role?: AuthRole;
}

export const createUserWithShift = async ({
  tag,
  group = DEFAULT_GROUP,
}: CreateUserWithShiftProps) => {
  const user = await createUser({ group });
  const shift = await createShift({
    userId: user._id,
    tag,
  });
  return { shift, user };
};

export const createShiftGroup = ({
  userId,
  tag,
  start = setHours(new Date(), 10),
  end = addWeeks(setHours(new Date(), 16), 1),
}: ShiftServiceCreateQueryProps &
  PartialRequired<ShiftServiceCreateBodyProps, "tag">) => {
  return ShiftServiceCreateGroup(
    { userId },
    { days: ["monday", "friday"], end, start, tag }
  );
};

export const createUserWithShiftGroup = async ({
  tag,
  group = "all",
}: CreateUserWithShiftProps) => {
  const user = await createUser({ group });
  const shifts = await createShiftGroup({
    userId: "a",
    tag,
    end: new Date(),
  });
  return { shifts, user };
};
