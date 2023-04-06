import { addHours, addWeeks, setHours } from "date-fns";
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

export const createShift = async ({
  userId,
  tag,
  start = setHours(new Date(), 10),
  end = addHours(setHours(new Date(), 10), 5),
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
  });
  return { shifts, user };
};
