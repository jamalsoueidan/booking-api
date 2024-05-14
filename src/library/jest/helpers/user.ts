import { faker } from "@faker-js/faker";

import { Professions, User, UserModel } from "~/functions/user";

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
  userMetaobjectId: faker.internet.url(),
  collectionMetaobjectId: faker.internet.url(),
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
  filter: Partial<Pick<User, "customerId">> = {},
  props: Partial<User> = {}
) => {
  const user = new UserModel({
    ...getUserObject({ ...props, ...filter }),
    isBusiness: true,
  });
  return user.save();
};
