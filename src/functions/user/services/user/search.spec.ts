import { createUser } from "~/library/jest/helpers";

import { UserServiceSearch } from "./search";

require("~/library/jest/mongoose/mongodb.jest");

import { faker } from "@faker-js/faker";
import { Location, LocationTypes } from "~/functions/location";
import { SlotWeekDays } from "~/functions/schedule";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { pickMultipleItems } from "~/library/jest/utils/utils";
import { Professions } from "../../user.types";

import { UserServiceFilters } from "./filters";
import { UserServiceProfessions } from "./professions";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceSearch", () => {
  it("Should get all users", async () => {
    const totalCount = 25;
    const limit = 10;
    const cities = [
      faker.location.city(),
      faker.location.city(),
      faker.location.city(),
    ];
    let location: Location;

    for (let customerId = 0; customerId < totalCount; customerId++) {
      location = await createLocation({
        customerId,
        city: faker.helpers.arrayElement(cities),
        locationType: faker.helpers.arrayElement(Object.values(LocationTypes)),
      });

      await createSchedule(
        { customerId },
        {
          days: [
            faker.helpers.arrayElement([
              SlotWeekDays.MONDAY,
              SlotWeekDays.FRIDAY,
            ]),
          ],
          totalProducts: 1,
          locations: [getDumbLocationObject()],
        }
      );

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

    const firstPage = await UserServiceSearch({ limit });
    expect(firstPage.totalCount).toBe(totalCount);

    const professions = await UserServiceProfessions();
    for (const { profession, count } of professions) {
      const result = await UserServiceSearch({
        limit: 10,
        filters: { profession },
      });
      expect(result.totalCount).toBe(count);

      const { specialties } = await UserServiceFilters({
        profession,
      });

      for (const { speciality, count } of specialties) {
        const result = await UserServiceSearch({
          limit: 10,
          filters: {
            profession,
            specialties: [speciality],
          },
        });
        expect(result.totalCount).toBe(count);
      }
    }

    const result = await UserServiceSearch({
      limit: 10,
      filters: {
        days: [SlotWeekDays.MONDAY],
        location: {
          city: location!.city,
          locationType: location!.locationType,
        },
      },
    });

    expect(result.results.length).toBeGreaterThanOrEqual(0);
  });

  it("should be able to search for usernams and fullname", async () => {
    let user;
    for (let customerId = 0; customerId < 25; customerId++) {
      user = await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
        }
      );
    }

    if (user) {
      //by username
      let keyword = user.username.substring(0, 5);
      let results = await UserServiceSearch({
        limit: 10,
        filters: {
          keyword,
        },
      });

      let allUsernamesContainMarlene = results.results.every((result) =>
        new RegExp(`${keyword}`, "i").test(result.username)
      );

      expect(allUsernamesContainMarlene).toBe(true);

      //by fullname
      keyword = user.fullname.substring(0, 5);
      results = await UserServiceSearch({
        limit: 10,
        filters: {
          keyword,
        },
      });

      allUsernamesContainMarlene = results.results.every((result) =>
        new RegExp(`${keyword}`, "i").test(result.fullname)
      );

      expect(allUsernamesContainMarlene).toBe(true);
    }
  });
});
