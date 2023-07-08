import { faker } from "@faker-js/faker";

export * from "./user";

export function omitObjectIdProps(obj: any) {
  const { _id, scheduleId, ...rest } = obj;
  return rest;
}

export const arrayElements = <T>(
  elements: Array<T>,
  total: number
): Array<T> => {
  return faker.helpers.arrayElements(elements, total);
};
