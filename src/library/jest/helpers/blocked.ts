import { faker } from "@faker-js/faker";
import { BlockedModel } from "~/functions/blocked/blocked.model";
import { Blocked } from "~/functions/blocked/blocked.types";

export const getBlockedObject = (
  props: Partial<Blocked> = {}
): Omit<Blocked, "_id"> => ({
  start: faker.date.past(),
  end: faker.date.future(),
  title: faker.company.name(),
  customerId: 1,
  ...props,
});

export const createBlocked = (props: Blocked) => {
  const blocked = new BlockedModel(getBlockedObject({ ...props }));
  return blocked.save();
};
