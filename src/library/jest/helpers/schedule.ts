import { faker } from "@faker-js/faker";
import {
  Schedule,
  ScheduleModel,
  ScheduleProductLocation,
  WeekDays,
} from "~/functions/schedule";
import { getProductObject } from "./product";

export const DEFAULT_GROUP = "all";

export type Choices = {
  totalProducts: number;
  days: WeekDays[];
  locations: ScheduleProductLocation[];
};

export const getScheduleObject = (
  props: Partial<Omit<Schedule, "_id">> = {},
  choices: Choices
): Omit<Schedule, "_id"> => {
  const products = Array(choices.totalProducts)
    .fill(0)
    .map(() => getProductObject({ locations: choices.locations }));

  const intervals = [
    {
      from: "12:00",
      to: "15:00",
    },
  ];

  const slots = choices.days.map((day) => ({
    day: day,
    intervals,
  }));

  return {
    name: faker.random.word(),
    customerId: faker.datatype.number(),
    slots,
    products,
    ...props,
  };
};

export const createSchedule = (
  props: Partial<Omit<Schedule, "_id">> = {},
  choices: Choices
) => {
  const schedule = new ScheduleModel(getScheduleObject(props, choices));

  return schedule.save();
};
