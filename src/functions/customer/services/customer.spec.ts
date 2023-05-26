import { faker } from "@faker-js/faker";
import {
  CustomerServiceGet,
  CustomerServiceIsBusiness,
  CustomerServiceUpsert,
  CustomerServiceUpsertBody,
} from "./customer";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerService", () => {
  const userData: CustomerServiceUpsertBody = {
    title: faker.name.jobTitle(),
    username: faker.internet.userName(),
    fullname: faker.name.fullName(),
    social: {
      instagram: faker.internet.url(),
      youtube: faker.internet.url(),
      twitter: faker.internet.url(),
    },
    active: true,
    aboutMe: faker.lorem.paragraph(),
    images: {
      profile: {
        url: faker.internet.avatar(),
      },
    },
    speaks: [faker.random.locale()],
  };

  it("Should create a user", async () => {
    const newUser = await CustomerServiceUpsert(
      { customerId: faker.datatype.number() },
      userData
    );

    expect(newUser).toMatchObject(userData);
  });

  it("Should get the customer by customerId", async () => {
    const newUser = await CustomerServiceUpsert(
      { customerId: faker.datatype.number() },
      userData
    );

    const user = await CustomerServiceGet({
      customerId: newUser.customerId,
    });

    expect(user.customerId).toBe(newUser.customerId);
  });

  it("Should get the customer by username", async () => {
    const newUser = await CustomerServiceUpsert(
      { customerId: faker.datatype.number() },
      userData
    );

    const user = await CustomerServiceGet({
      username: newUser?.username,
    });

    expect(user.customerId).toBe(newUser.customerId);
  });

  it("Should check if customer exist", async () => {
    const newUser = await CustomerServiceUpsert(
      { customerId: faker.datatype.number() },
      userData
    );

    const user = await CustomerServiceIsBusiness({
      customerId: newUser.customerId,
    });
    expect(user.exists).toEqual(true);
  });

  it("Should update a user by customerId", async () => {
    const filter = { customerId: faker.datatype.number() };
    // Create a user first
    await CustomerServiceUpsert(filter, userData);

    // Update the user
    const updatedData: CustomerServiceUpsertBody = {
      ...userData,
      fullname: faker.name.fullName(),
    };

    const updatedUser = await CustomerServiceUpsert(filter, updatedData);

    expect(updatedUser.fullname).toEqual(updatedData.fullname);
  });
});
