import { faker } from "@faker-js/faker";
import { createUser } from "~/library/jest/helpers";
import { pickMultipleItems } from "~/library/jest/utils/utils";
import { Professions } from "../../user.types";
import { UserServiceTop } from "./top";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceTop", () => {
  it("Should get all users with professions", async () => {
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
              Professions.BROW_TECHNICIAN,
              Professions.LASH_TECHNICIAN,
              Professions.NAIL_TECHNICIAN,
              Professions.MASSAGE_THERAPIST,
              Professions.MAKEUP_ARTIST,
            ]),
          ],
          specialties: pickMultipleItems(["a", "b", "c"], 2),
        }
      );
    }

    const firstPage = await UserServiceTop({ limit: 5 });
    //console.log(JSON.stringify(firstPage));
    const secondPage = await UserServiceTop({ limit: 5, page: 2 });
    //console.log(JSON.stringify(secondPage));
  });
});
