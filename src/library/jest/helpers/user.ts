import { faker } from "@faker-js/faker";
import { User, UserServiceCreateOrUpdate } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getUserObject = (props: Partial<User> = {}) => ({
  title: faker.name.jobTitle(),
  username: faker.internet.userName(),
  fullname: faker.name.fullName(),
  social_urls: {
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
  return UserServiceCreateOrUpdate(fitler, getUserObject(props));
};
