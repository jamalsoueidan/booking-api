import { Tag } from "~/functions/shift";
import { User } from "~/functions/user";

export type AvailabilityUser = User & { userId: string; tag: Tag };

export type AvailabilityHourUser = {
  user: User;
};

export type AvailabilityHourRange = {
  start: Date;
  end: Date;
};

export type AvailabilityHour = AvailabilityHourUser & AvailabilityHourRange;

export interface AvailabilityShift {
  date: Date;
  start: Date;
  end: Date;
  bufferTime: number;
  duration: number;
  total: number;
  hours: AvailabilityHour[];
}
