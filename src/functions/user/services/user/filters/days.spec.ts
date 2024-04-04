import { faker } from "@faker-js/faker";
import { SlotWeekDays } from "~/functions/schedule";
import { Professions } from "~/functions/user/user.types";
import { createUser } from "~/library/jest/helpers";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { UserServiceFilterDays } from "./days";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceFilterDays", () => {
  it("should include specified days in the results", async () => {
    const totalCount = 25;
    const expectedDays: SlotWeekDays[] = [
      SlotWeekDays.MONDAY,
      SlotWeekDays.FRIDAY,
    ];

    for (let customerId = 0; customerId < totalCount; customerId++) {
      await createSchedule(
        { customerId },
        {
          days: [faker.helpers.arrayElement(expectedDays)],
          totalProducts: 1,
          locations: [],
        }
      );

      await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
          professions: [Professions.LASH, Professions.MAKEUP_ARTIST],
        }
      );
    }

    const results = await UserServiceFilterDays({
      profession: Professions.LASH,
    });

    const resultDays = results.map((result) => result.day);

    expectedDays.forEach((day) => {
      expect(resultDays).toContain(day);
    });
  });
});
