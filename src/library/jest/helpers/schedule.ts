import { faker } from "@faker-js/faker";
import {
  Schedule,
  ScheduleModel,
  ScheduleProductLocation,
  ScheduleSlotInterval,
  SlotWeekDays,
} from "~/functions/schedule";
import { getProductObject } from "./product";

export const DEFAULT_GROUP = "all";

export type Choices = {
  totalProducts?: number;
  days?: SlotWeekDays[];
  locations?: ScheduleProductLocation[];
  interval?: ScheduleSlotInterval;
};

export const getScheduleObject = (
  props: Partial<Omit<Schedule, "_id">> = {},
  choices: Choices
): Omit<Schedule, "_id"> => {
  const products =
    props.products ||
    Array(choices.totalProducts)
      .fill(0)
      .map(() => getProductObject({ locations: choices.locations }));

  const intervals = [
    choices.interval || {
      from: "12:00",
      to: "15:00",
    },
  ];

  const days = choices.days || [SlotWeekDays.MONDAY, SlotWeekDays.TUESDAY];
  const slots = days.map((day) => ({
    day: day,
    intervals,
  }));

  return {
    name: faker.word.sample(),
    customerId: faker.number.int(),
    slots,
    products,
    ...props,
  };
};

export const createSchedule = (
  props: Partial<Omit<Schedule, "_id">> = {},
  choices: Choices = {}
) => {
  const schedule = new ScheduleModel(getScheduleObject(props, choices));
  return schedule.save();
};
