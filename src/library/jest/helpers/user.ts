import { faker } from "@faker-js/faker";
import { CustomerServiceUpsert } from "~/functions/customer/services/customer";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getUserObject = (
  props: Partial<User> = {}
): Omit<User, "_id"> => ({
  username: faker.internet.userName().toLowerCase(),
  fullname: faker.person.fullName(),
  social: {
    instagram: faker.internet.url(),
    youtube: faker.internet.url(),
    twitter: faker.internet.url(),
  },
  shortDescription: faker.lorem.paragraph(),
  active: true,
  isBusiness: true,
  images: {
    profile: {
      url: faker.internet.avatar(),
    },
  },
  speaks: [faker.location.countryCode()],
  locations: [],
  customerId: faker.number.int({ min: 1, max: 10000000 }),
  ...props,
});

export const createUser = (
  fitler: Pick<User, "customerId">,
  props: Partial<User> = {}
) => {
  return CustomerServiceUpsert(fitler, getUserObject(props));
};
