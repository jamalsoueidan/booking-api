import { createUser } from "~/library/jest/helpers";
import { Professions } from "../../../user.types";
import { UserServiceList } from "../list";

import { pickMultipleItems } from "~/library/jest/utils/utils";
import { UserServiceFiltersSpecialties } from "./specialties";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceFiltersSpecialties", () => {
  it("Should get group and count specialties by all users", async () => {
    for (let customerId = 0; customerId < 25; customerId++) {
      await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
          professions: [Professions.MAKEUP_ARTIST],
          specialties: pickMultipleItems(["a", "b", "c"], 2),
        }
      );
    }

    const result = await UserServiceFiltersSpecialties({
      profession: Professions.MAKEUP_ARTIST,
    });

    for (const key in result) {
      expect(typeof result[key]).toBe("number");
    }

    const users = await UserServiceList({
      limit: 5,
      filters: {
        profession: Professions.MAKEUP_ARTIST,
        specialties: ["a"],
      },
    });

    const allHaveSpecialtyA = users.results.every(
      (user) => user.specialties && user.specialties.includes("a")
    );

    expect(allHaveSpecialtyA).toBeTruthy();
  });
});
