import { faker } from "@faker-js/faker";
import {
  CustomerServiceUpsert,
  CustomerServiceUpsertBody,
} from "~/functions/customer/services/customer";
import { createUser } from "~/library/jest/helpers";
import { Professions } from "../user.types";
import {
  UserServiceGet,
  UserServiceList,
  UserServiceProfessions,
} from "./user";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserService", () => {
  it("Should find user", async () => {
    // Create multiple users
    const filter = { customerId: faker.datatype.number() };
    const username = faker.internet.userName();
    // Create a user first
    const userData: CustomerServiceUpsertBody = {
      yearsExperience: 1,
      professions: [Professions.MAKEUP_ARTIST],
      username,
      fullname: faker.name.fullName(),
      shortDescription: faker.lorem.paragraph(),
      aboutMe: faker.lorem.paragraph(),
      speaks: [faker.location.countryCode()],
      active: true,
      isBusiness: true,
      locations: [],
    };

    await CustomerServiceUpsert(filter, userData);

    const findUser = await UserServiceGet({ username });

    expect(findUser.fullname).toEqual(userData.fullname);
  });

  it("Should get all users", async () => {
    for (let customerId = 0; customerId < 25; customerId++) {
      await createUser({ customerId }, { active: true, isBusiness: true });
    }

    const firstPage = await UserServiceList({ limit: 10 });
    expect(firstPage.results.length).toBe(10);

    const secondPage = await UserServiceList({
      nextCursor: firstPage.nextCursor,
      limit: 10,
    });
    expect(secondPage.results.length).toBe(10);

    // Check that the second page does not contain any users from the first page
    const firstPageUserIds = new Set(
      firstPage.results.map((user) => user._id.toString())
    );
    secondPage.results.forEach((user) => {
      expect(firstPageUserIds.has(user._id.toString())).toBe(false);
    });

    const thirdPage = await UserServiceList({
      nextCursor: secondPage.nextCursor,
      limit: 10,
    });
    expect(thirdPage.results.length).toBe(5);

    const secondPageUserIds = new Set(
      secondPage.results.map((user) => user._id.toString())
    );

    thirdPage.results.forEach((user) => {
      expect(secondPageUserIds.has(user._id.toString())).toBe(false);
    });
  });

  it("Should get group and count professions by all users", async () => {
    const professions = Object.values(Professions);

    const professionCount = faker.datatype.number({
      min: 1,
      max: professions.length,
    });

    for (let customerId = 0; customerId < 25; customerId++) {
      const pickedProfessions = faker.helpers.arrayElements(
        professions,
        professionCount
      );

      await createUser(
        { customerId },
        { active: true, isBusiness: true, professions: pickedProfessions }
      );
    }

    const result = await UserServiceProfessions();
    for (const key in result) {
      expect(typeof result[key]).toBe("number");
    }
  });
});
