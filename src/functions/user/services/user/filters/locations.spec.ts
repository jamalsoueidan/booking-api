import { faker } from "@faker-js/faker";
import { LocationModel, LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import { createLocation } from "~/library/jest/helpers/location";
import { pickMultipleItems } from "~/library/jest/utils/utils";
import { UserModel } from "../../../user.model";
import { Professions } from "../../../user.types";
import { UserServiceList } from "../list";
import { UserServiceFilterLocations } from "./locations";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceLocations", () => {
  beforeAll(async () => {
    await UserModel.createIndexes();
    await LocationModel.createIndexes();
  });
  it("Should get group and count professions by all users", async () => {
    const cities = [
      faker.location.city(),
      faker.location.city(),
      faker.location.city(),
    ];

    for (let customerId = 0; customerId < 25; customerId++) {
      await createLocation({
        customerId,
        city: faker.helpers.arrayElement(cities),
        locationType: faker.helpers.arrayElement(Object.values(LocationTypes)),
      });

      await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
          professions: [Professions.LASH, Professions.MAKEUP_ARTIST],
          specialties: pickMultipleItems(["a", "b", "c"], 2),
        }
      );
    }

    const results = await UserServiceFilterLocations({
      profession: Professions.LASH,
    });

    const users = await UserServiceList({
      limit: 5,
      filters: {
        profession: Professions.MAKEUP_ARTIST,
        specialties: ["a"],
        location: {
          city: results[0].city,
          locationType: results[0].locationType,
        },
      },
    });

    const allHaveSpecialtyA = users.results.every((user) => {
      return user.locations && user.locations.city === results[0].city;
    });

    expect(allHaveSpecialtyA).toBeTruthy();
  });
});
