import { faker } from "@faker-js/faker";
import { createUser } from "~/library/jest/helpers";
import { Professions } from "../../user.types";
import { UserServiceList } from "./list";
import { UserServiceProfessions } from "./professions";
import { UserServiceSpecialties } from "./specialties";

require("~/library/jest/mongoose/mongodb.jest");

export const pickMultipleItems = (array: string[], count: number) => {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

describe("UserServiceList", () => {
  it("Should get all users", async () => {
    for (let customerId = 0; customerId < 25; customerId++) {
      await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
          professions: [
            faker.helpers.arrayElement([
              Professions.HAIR_STYLIST,
              Professions.ESTHETICIAN,
            ]),
          ],
          specialties: pickMultipleItems(["a", "b", "c"], 2),
        }
      );
    }

    const firstPage = await UserServiceList({ limit: 10 });
    expect(firstPage.results.length).toBe(10);
    expect(firstPage.total).toBe(25);

    const professions = await UserServiceProfessions();
    for (const profession in professions) {
      const result = await UserServiceList({ limit: 10, profession });
      expect(result.total).toBe(professions[profession]);

      const specialties = await UserServiceSpecialties({
        profession,
      });
      for (const specialty in specialties) {
        const result = await UserServiceList({
          limit: 10,
          profession,
          specialties: [specialty],
        });
        expect(result.total).toBe(specialties[specialty]);
      }
    }
  });
});
