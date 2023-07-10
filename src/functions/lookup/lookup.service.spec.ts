import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { LookupServiceCreate } from "./lookup.service";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services", () => {
  return {
    LocationServiceLookup: jest.fn().mockResolvedValueOnce({
      location: {
        _id: new mongoose.Types.ObjectId(),
        name: faker.name.firstName(),
        customerId: faker.datatype.number({ min: 1, max: 100000 }),
        fullAddress: faker.address.streetAddress(),
        distanceHourlyRate: faker.datatype.number({ min: 1, max: 5 }),
        fixedRatePerKm: faker.datatype.number({ min: 1, max: 5 }),
        minDistanceForFree: faker.datatype.number({ min: 1, max: 5 }),
      },
      travelTime: {
        duration: { text: "14 mins", value: 831 },
        distance: { text: "5.3 km", value: 5342 },
      },
    }),
  };
});

describe("LookupService", () => {
  it("should be able to create lookup", async () => {
    const lookup = await LookupServiceCreate({
      customerId: 1,
      locationId: new mongoose.Types.ObjectId(),
      destination: {
        name: "test",
        fullAddress: "dortesvej 21 1 th, 8220 Brabrand",
      },
    });

    expect(lookup).toBeDefined();
  });
});
