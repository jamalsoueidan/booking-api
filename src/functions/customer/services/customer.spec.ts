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
    username: faker.internet.userName(),
    fullname: faker.person.fullName(),
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
    locations: [],
    speaks: [faker.location.countryCode()],
    isBusiness: true,
  };

  it("Should create a user", async () => {
    const newUser = await CustomerServiceUpsert(
      { customerId: faker.number.int() },
      userData
    );

    expect(newUser).toMatchObject(userData);
  });

  it("Should get the customer by customerId", async () => {
    const newUser = await CustomerServiceUpsert(
      { customerId: faker.number.int() },
      userData
    );

    const user = await CustomerServiceGet({
      customerId: newUser.customerId,
    });

    expect(user.customerId).toBe(newUser.customerId);
  });

  it("Should check if customer exist", async () => {
    const newUser = await CustomerServiceUpsert(
      { customerId: faker.number.int() },
      userData
    );

    const user = await CustomerServiceIsBusiness({
      customerId: newUser.customerId,
    });
    expect(user.isBusiness).toEqual(true);
  });

  it("Should update a user by customerId", async () => {
    const filter = { customerId: faker.number.int() };
    // Create a user first
    await CustomerServiceUpsert(filter, userData);

    // Update the user
    const updatedData: CustomerServiceUpsertBody = {
      ...userData,
      fullname: faker.person.fullName(),
    };

    const updatedUser = await CustomerServiceUpsert(filter, updatedData);

    expect(updatedUser.fullname).toEqual(updatedData.fullname);
  });
});
