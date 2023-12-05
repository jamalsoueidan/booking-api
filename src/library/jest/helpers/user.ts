import { faker } from "@faker-js/faker";
import { CustomerServiceCreate } from "~/functions/customer/services/customer";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getUserObject = (
  props: Partial<User> = {}
): Omit<User, "_id"> => ({
  email: faker.internet.email(),
  username: faker.internet.userName().toLowerCase(),
  fullname: faker.person.fullName(),
  social: {
    instagram: faker.internet.url(),
    youtube: faker.internet.url(),
    x: faker.internet.url(),
    facebook: faker.internet.url(),
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
  filter: Pick<User, "customerId">,
  props: Partial<User> = {}
) => {
  return CustomerServiceCreate(getUserObject({ ...props, ...filter }));
};
