import { faker } from "@faker-js/faker";
import { CustomerServiceCreate } from "~/functions/customer/services/customer";
import { getUserObject } from "~/library/jest/helpers";
import { Professions } from "../../user.types";
import { UserServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceGet", () => {
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
});
