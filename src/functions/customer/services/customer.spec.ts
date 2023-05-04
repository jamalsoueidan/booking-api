import { faker } from "@faker-js/faker";
import {
  CustomerServiceCreateOrUpdate,
  CustomerServiceCreateOrUpdateBody,
} from "./customer";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerService", () => {
  it("Should create a user", async () => {
    const userData: CustomerServiceCreateOrUpdateBody = {
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

    const newUser = await CustomerServiceCreateOrUpdate(
      { customerId: faker.datatype.number() },
      userData
    );

    expect(newUser).toMatchObject(userData);
  });

  it("Should update a user by customerId", async () => {
    const filter = { customerId: faker.datatype.number() };
    // Create a user first
    const userData: CustomerServiceCreateOrUpdateBody = {
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

    const createdUser = await CustomerServiceCreateOrUpdate(filter, userData);

    // Update the user
    const updatedData: CustomerServiceCreateOrUpdateBody = {
      ...userData,
      fullname: faker.name.fullName(),
    };

    const updatedUser = await CustomerServiceCreateOrUpdate(
      filter,
      updatedData
    );

    expect(updatedUser.fullname).toEqual(updatedData.fullname);
  });
});
