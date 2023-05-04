import { faker } from "@faker-js/faker";
import { UserModel } from "./user.model";
import {
  UserServiceCreateOrUpdate,
  UserServiceCreateOrUpdateBody,
  UserServiceGet,
} from "./user.service";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserService", () => {
  afterEach(async () => {
    // Clean up the database after each test
    await UserModel.deleteMany({});
  });

  it("Should create a user", async () => {
    const userData: UserServiceCreateOrUpdateBody = {
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
    };

    const newUser = await UserServiceCreateOrUpdate(
      { customerId: faker.datatype.number() },
      userData
    );

    expect(newUser).toMatchObject(userData);
  });

  it("Should update a user by customerId", async () => {
    const filter = { customerId: faker.datatype.number() };
    // Create a user first
    const userData: UserServiceCreateOrUpdateBody = {
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
    };

    const createdUser = await UserServiceCreateOrUpdate(filter, userData);

    // Update the user
    const updatedData: UserServiceCreateOrUpdateBody = {
      ...userData,
      fullname: faker.name.fullName(),
    };

    const updatedUser = await UserServiceCreateOrUpdate(filter, updatedData);

    expect(updatedUser.fullname).toEqual(updatedData.fullname);
  });

  it("Should find user", async () => {
    // Create multiple users
    const filter = { customerId: faker.datatype.number() };
    // Create a user first
    const userData: UserServiceCreateOrUpdateBody = {
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
    };

    await UserServiceCreateOrUpdate(filter, userData);

    const findUser = await UserServiceGet(filter);

    expect(findUser.fullname).toEqual(userData.fullname);
  });
});
