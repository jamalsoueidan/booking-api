import { faker } from "@faker-js/faker";
import {
  CustomerServiceUpsert,
  CustomerServiceUpsertBody,
} from "~/functions/customer/services/customer";
import { createUser } from "~/library/jest/helpers";
import { UserServiceGet, UserServiceList } from "./user";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserService", () => {
  it("Should find user", async () => {
    // Create multiple users
    const filter = { customerId: faker.datatype.number() };
    const username = faker.internet.userName();
    // Create a user first
    const userData: CustomerServiceUpsertBody = {
      title: faker.name.jobTitle(),
      username,
      fullname: faker.name.fullName(),
      social: {
        instagram: faker.internet.url(),
        youtube: faker.internet.url(),
        twitter: faker.internet.url(),
      },
      shortDescription: faker.lorem.paragraph(),
      aboutMe: faker.lorem.paragraph(),
      avatar: faker.internet.avatar(),
      speaks: [faker.random.locale()],
    };

    await CustomerServiceUpsert(filter, userData);

    const findUser = await UserServiceGet({ username });

    expect(findUser.fullname).toEqual(userData.fullname);
  });

  it("Should get all users", async () => {
    await createUser({ customerId: 123 }, { username: "test" });
    await createUser({ customerId: 321 }, { username: "asd" });

    const users = await UserServiceList();

    expect(users).toHaveLength(2);
  });
});
