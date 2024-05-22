import { createUser } from "~/library/jest/helpers";

import { faker } from "@faker-js/faker";
import { LocationTypes } from "~/functions/location";
import { SlotWeekDays } from "~/functions/schedule";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { pickMultipleItems } from "~/library/jest/utils/utils";
import { Professions } from "../../user.types";
import { UserServiceFilters } from "./filters";
import { UserServiceSearch } from "./search";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceFilters", () => {
  const totalCount = 25;
  const expectedDays: SlotWeekDays[] = [
    SlotWeekDays.MONDAY,
    SlotWeekDays.FRIDAY,
  ];

  const cities = [
    faker.location.city(),
    faker.location.city(),
    faker.location.city(),
  ];

  it("should be able to find users by locations", async () => {
    for (let customerId = 0; customerId < 2; customerId++) {
      const user = await createUser(
        {},
        {
          active: true,
          isBusiness: true,
          professions: [Professions.LASH, Professions.MAKEUP_ARTIST],
          specialties: pickMultipleItems(["a", "b", "c"], 2),
        }
      );

      await createLocation({
        customerId: user.customerId,
        city: faker.helpers.arrayElement(cities),
        locationType: faker.helpers.arrayElement(Object.values(LocationTypes)),
        deletedAt: undefined,
      });
    }

    const results = await UserServiceFilters({
      profession: Professions.LASH,
    });

    const pickLocation = results.locations[0];

    const users = await UserServiceSearch({
      limit: 5,
      filters: {
        location: {
          city: pickLocation.city,
          locationType: pickLocation.locationType,
          originType: pickLocation.originType,
        },
      },
    });

    const allHaveSpecialtyA = users.results.every((user) => {
      return user.locations.length > 0;
    });

    expect(allHaveSpecialtyA).toBeTruthy();
  });

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

    const results = await UserServiceFilters({
      profession: Professions.MAKEUP_ARTIST,
    });

    const pickSpecialty = results.specialties[0];
    const users = await UserServiceSearch({
      limit: 5,
      filters: {
        profession: Professions.MAKEUP_ARTIST,
        specialties: [pickSpecialty.speciality],
      },
    });

    const allHaveSpecialtyA = users.results.every(
      (user) =>
        user.specialties && user.specialties.includes(pickSpecialty.speciality)
    );

    expect(allHaveSpecialtyA).toBeTruthy();
  });

  it("should include specified days in the results", async () => {
    for (let customerId = 0; customerId < totalCount; customerId++) {
      await createScheduleWithProducts(
        { customerId },
        {
          days: [faker.helpers.arrayElement(expectedDays)],
          totalProducts: 1,
          locations: [getDumbLocationObject()],
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

    const results = await UserServiceFilters({
      profession: Professions.LASH,
    });

    const resultDays = results.availableDays.map((result) => result.day);

    expectedDays.forEach((day) => {
      expect(resultDays).toContain(day);
    });
  });

  it("should work without profession", async () => {
    const totalCount = 25;
    const expectedDays: SlotWeekDays[] = [
      SlotWeekDays.MONDAY,
      SlotWeekDays.FRIDAY,
    ];

    for (let customerId = 0; customerId < totalCount; customerId++) {
      await createLocation({
        customerId,
        city: faker.helpers.arrayElement(cities),
        locationType: faker.helpers.arrayElement(Object.values(LocationTypes)),
      });

      await createScheduleWithProducts(
        { customerId },
        {
          days: [faker.helpers.arrayElement(expectedDays)],
          totalProducts: 4,
          locations: [getDumbLocationObject()],
        }
      );

      await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
          specialties: pickMultipleItems(["a", "b", "c"], 2),
        }
      );
    }

    const results = await UserServiceFilters({
      profession: Professions.LASH,
    });

    expect(results).toBeDefined();
  });
});
