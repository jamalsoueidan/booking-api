import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { LocationServiceGet } from "~/functions/location/services/get";
import { LocationServiceGetTravelTime } from "~/functions/location/services/get-travel-time";
import { ShippingServiceCreate } from "~/functions/shipping/services/create";
import { ShippingServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services/get-travel-time", () => {
  return {
    LocationServiceGetTravelTime: jest.fn().mockResolvedValueOnce({
      duration: { text: "14 mins", value: 831 },
      distance: { text: "5.3 km", value: 5342 },
    } as Awaited<ReturnType<typeof LocationServiceGetTravelTime>>),
  };
});

jest.mock("~/functions/location/services/get", () => {
  return {
    LocationServiceGet: jest.fn().mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      name: faker.person.firstName(),
      customerId: faker.number.int({ min: 1, max: 100000 }),
      locationType: LocationTypes.ORIGIN,
      originType: LocationOriginTypes.COMMERCIAL,
      fullAddress: faker.location.streetAddress(),
      distanceHourlyRate: faker.number.int({ min: 1, max: 5 }),
      fixedRatePerKm: faker.number.int({ min: 1, max: 5 }),
      distanceForFree: faker.number.int({ min: 1, max: 5 }),
      maxDriveDistance: 500,
      minDriveDistance: 0,
      startFee: 0,
    } as Awaited<ReturnType<typeof LocationServiceGet>>),
  };
});

describe("CustomerShippingService", () => {
  it("should be able to get shipping", async () => {
    const createdShipping = await ShippingServiceCreate({
      customerId: 1,
      locationId: new mongoose.Types.ObjectId(),
      destination: {
        name: "test",
        fullAddress: "dortesvej 21 1 th, 8220 Brabrand",
      },
    });

    const shipping = await ShippingServiceGet({
      shippingId: createdShipping._id,
    });

    expect(shipping).toBeDefined();
  });
});
