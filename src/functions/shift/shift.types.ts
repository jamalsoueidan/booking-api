export enum Tag {
  "weekday" = "weekday",
  "weekend" = "weekend",
  "all_day" = "all_day",
  "end_of_week" = "end_of_week",
  "start_of_week" = "start_of_week",
  "middle_of_week" = "middle_of_week",
}

export const TagKeys = Object.values(Tag).filter(
  (x, i, a) => a.indexOf(x) === i
);

export interface Shift {
  _id: string;
  userId: string;
  groupId?: string;
  start: Date;
  end: Date;
  tag: Tag;
}

export type ShiftServiceGetAllProps = Pick<Shift, "userId" | "start" | "end">;

export type ShiftServiceRange = Pick<Shift, "start" | "end">;

export type ShiftBody = Pick<Shift, "tag" | "start" | "end">;

/*
  Create
*/

export type ShiftServiceCreateQueryProps = Pick<Shift, "userId">;
export type ShiftServiceCreateBodyProps = ShiftBody;

export type ShiftServiceCreateProps = {
  query: ShiftServiceCreateQueryProps;
  body: ShiftServiceCreateBodyProps;
};

export type ShiftServiceDestroyProps = {
  shift: string;
  userId: string;
};

export type ShiftServiceDestroyReturn = {
  acknowledged: boolean;
  deletedCount: number;
};

export type ShiftServiceUpdateQueryProps = {
  shift: string;
  userId: string;
};

export type ShiftServiceUpdateBodyProps = Omit<ShiftBody, "tag">; // if we allow tag, and in product we choose the tag?

export type ShiftServiceUpdateProps = {
  query: ShiftServiceUpdateQueryProps;
  body: ShiftServiceUpdateBodyProps;
};

/*
  Group
*/
export type ShiftServiceGetGroupProps = {
  groupId: string;
  userId: string;
};

export type ShiftServiceGetGroupReturn = ShiftServiceCreateGroupBodyProps;

export type ShiftServiceCreateGroupQueryProps = {
  userId: string;
};

export type ShiftServiceDaysInterval =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type ShiftServiceCreateGroupBodyProps = ShiftBody & {
  days: Array<ShiftServiceDaysInterval>;
};

export type ShiftServiceCreateGroupProps = {
  query: ShiftServiceCreateGroupQueryProps;
  body: ShiftServiceCreateGroupBodyProps;
};

export type ShiftServiceUpdateGroupQueryProps = ShiftServiceGetGroupProps;

export type ShiftServiceUpdateGroupBodyProps = ShiftServiceCreateGroupBodyProps;
export interface ShiftServiceUpdateGroupProps {
  query: ShiftServiceUpdateGroupQueryProps;
  body: ShiftServiceUpdateGroupBodyProps;
}

export type ShiftServiceDestroyGroupProps = ShiftServiceUpdateGroupQueryProps;

export type ShiftServiceDestroyGroupReturn = {
  acknowledged: boolean;
  deletedCount: number;
};
