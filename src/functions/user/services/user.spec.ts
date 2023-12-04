import { faker } from "@faker-js/faker";
import { CustomerServiceCreate } from "~/functions/customer/services/customer";
import { createUser, getUserObject } from "~/library/jest/helpers";
import { Professions } from "../user.types";
import {
  UserServiceGet,
  UserServiceList,
  UserServiceProfessions,
  UserServiceUsernameTaken,
} from "./user";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserService", () => {
  it("check username is taken", async () => {
    const userData = getUserObject();

    await CustomerServiceCreate(userData);

    let response = await UserServiceUsernameTaken({
      username: userData.username,
    });

    expect(response.usernameTaken).toBeTruthy();

    response = await UserServiceUsernameTaken({
      username: "testerne",
    });

    expect(response.usernameTaken).toBeFalsy();
  });

  it("Should find user", async () => {
    const username = faker.internet.userName();
    const userData = getUserObject({
      yearsExperience: 1,
      professions: [Professions.MAKEUP_ARTIST],
      username,
    });

    await CustomerServiceCreate(userData);

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

    const professionCount = faker.number.int({
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
