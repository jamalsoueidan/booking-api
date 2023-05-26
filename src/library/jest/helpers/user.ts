import { faker } from "@faker-js/faker";
import { CustomerServiceUpsert } from "~/functions/customer";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getUserObject = (props: Partial<User> = {}) => ({
  title: faker.name.jobTitle(),
  username: faker.internet.userName().toLowerCase(),
  fullname: faker.name.fullName(),
  social: {
    instagram: faker.internet.url(),
    youtube: faker.internet.url(),
    twitter: faker.internet.url(),
  },
  description: faker.lorem.paragraph(),
  active: true,
  avatar: faker.internet.avatar(),
  speaks: [faker.random.locale()],
  ...props,
});

export const createUser = (
  fitler: Pick<User, "customerId">,
  props: Partial<User> = {}
) => {
  return CustomerServiceUpsert(fitler, getUserObject(props));
};
