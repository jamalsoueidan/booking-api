import { faker } from "@faker-js/faker";
import { createUser } from "~/library/jest/helpers";
import { pickMultipleItems } from "~/library/jest/utils/utils";
import { Professions } from "../../user.types";
import { UserServiceFiltersSpecialties } from "./filters/specialties";
import { UserServiceList } from "./list";
import { UserServiceProfessions } from "./professions";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceList", () => {
  it("Should get all users", async () => {
    const totalCount = 25;
    const limit = 10;

    for (let customerId = 0; customerId < totalCount; customerId++) {
      const user = await createUser(
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

    const firstPage = await UserServiceList({ limit });
    expect(firstPage.results.length).toBe(limit);
    expect(firstPage.totalCount).toBe(totalCount);

    const professions = await UserServiceProfessions();
    for (const profession in professions) {
      const result = await UserServiceList({
        limit: 10,
        filters: { profession },
      });
      expect(result.totalCount).toBe(professions[profession]);

      const specialties = await UserServiceFiltersSpecialties({
        profession,
      });

      for (const specialty in specialties) {
        const result = await UserServiceList({
          limit: 10,
          filters: {
            profession,
            specialties: [specialty],
          },
        });
        expect(result.totalCount).toBe(specialties[specialty]);
      }
    }
  });
});
