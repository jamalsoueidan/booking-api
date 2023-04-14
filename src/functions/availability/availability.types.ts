import { Tag } from "~/functions/shift";
import { User } from "~/functions/user";

export interface AvailabilityServiceAvailabilityProps {
  userId?: string;
  productId: number;
  start: Date;
  end: Date;
}

export type WidgetUser = User & { userId: string; tag: Tag };

export type WidgetHourUser = {
  user: User;
};

export type WidgetHourRange = {
  start: Date;
  end: Date;
};

export type WidgetHour = WidgetHourUser & WidgetHourRange;

export interface WidgetShift {
  date: Date;
  start: Date;
  end: Date;
  bufferTime: number;
  duration: number;
  total: number;
  hours: WidgetHour[];
}
