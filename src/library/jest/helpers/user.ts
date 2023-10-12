import { faker } from "@faker-js/faker";
import { CustomerServiceUpsert } from "~/functions/customer";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getUserObject = (props: Partial<User> = {}) => ({
  title: faker.person.jobTitle(),
  username: faker.internet.userName().toLowerCase(),
  fullname: faker.person.fullName(),
  social: {
    instagram: faker.internet.url(),
    youtube: faker.internet.url(),
    twitter: faker.internet.url(),
  },
  description: faker.lorem.paragraph(),
  active: true,
  isBusiness: true,
  avatar: faker.internet.avatar(),
  speaks: [faker.location.countryCode()],
  locations: [],
  ...props,
});

export const createUser = (
  fitler: Pick<User, "customerId">,
  props: Partial<User> = {}
) => {
  return CustomerServiceUpsert(fitler, getUserObject(props));
};
