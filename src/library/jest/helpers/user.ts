import { faker } from "@faker-js/faker";
import { CustomerServiceCreate } from "~/functions/customer/services/customer";
import { Professions, User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

function pickRandomProfessionsOneOrMore(): Professions[] {
  const professionsArray = Object.values(Professions);
  const shuffled = faker.helpers.shuffle(professionsArray);
  const pickCount = faker.number.int({
    min: 1,
    max: professionsArray.length,
  });
  return shuffled.slice(0, pickCount);
}

export const getUserObject = (
  props: Partial<User> = {}
): Omit<User, "_id"> => ({
  email: faker.internet.email(),
  professions: pickRandomProfessionsOneOrMore(),
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
      url: faker.image.avatar(),
    },
  },
  speaks: [faker.location.countryCode()],
  customerId: faker.number.int({ min: 1, max: 10000000 }),
  ...props,
});

export const createUser = (
  filter: Pick<User, "customerId">,
  props: Partial<User> = {}
) => {
  return CustomerServiceCreate(getUserObject({ ...props, ...filter }));
};
