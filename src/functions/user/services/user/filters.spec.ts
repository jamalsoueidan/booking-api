import { createUser } from "~/library/jest/helpers";

import { faker } from "@faker-js/faker";
import { LocationTypes } from "~/functions/location";
import { SlotWeekDays } from "~/functions/schedule";
import { createLocation } from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { pickMultipleItems } from "~/library/jest/utils/utils";
import { Professions } from "../../user.types";
import { UserServiceFilters } from "./filters";
import { UserServiceList } from "./list";

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

    const results = await UserServiceFilters({
      profession: Professions.LASH,
    });

    const pickLocation = results.locations[0];
    const users = await UserServiceList({
      limit: 5,
      filters: {
        profession: Professions.MAKEUP_ARTIST,
        specialties: ["a"],
        location: pickLocation,
      },
    });

    const allHaveSpecialtyA = users.results.every((user) => {
      return user.locations && user.locations.city === pickLocation.city;
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

    const pickSpecialty = results.specialities[0];
    const users = await UserServiceList({
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

      await createSchedule(
        { customerId },
        {
          days: [faker.helpers.arrayElement(expectedDays)],
          totalProducts: 4,
          locations: [],
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

    console.log(JSON.stringify(results));
  });
});
