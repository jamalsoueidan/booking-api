import { faker } from "@faker-js/faker";
import {
  CustomerServiceCreateOrUpdate,
  CustomerServiceCreateOrUpdateBody,
} from "~/functions/customer/services/customer";
import { UserServiceGet } from "./user";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserService", () => {
  it("Should find user", async () => {
    // Create multiple users
    const filter = { customerId: faker.datatype.number() };
    const username = faker.internet.userName();
    // Create a user first
    const userData: CustomerServiceCreateOrUpdateBody = {
      title: faker.name.jobTitle(),
      username,
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

    await CustomerServiceCreateOrUpdate(filter, userData);

    const findUser = await UserServiceGet({ username });

    expect(findUser.fullname).toEqual(userData.fullname);
  });
});
