import { faker } from "@faker-js/faker";
import { createUser } from "~/library/jest/helpers";
import { Professions } from "../../user.types";
import { UserServiceProfessions } from "./professions";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceProfessions", () => {
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
    expect(result.length).toBeGreaterThan(0);
    result.map((item) => {
      expect(item.count).toBeGreaterThan(0);
    });
  });
});
