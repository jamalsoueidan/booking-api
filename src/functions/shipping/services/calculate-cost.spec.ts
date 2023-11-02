import { faker } from "@faker-js/faker";
import { getLocationObject } from "~/library/jest/helpers/location";
import { Shipping } from "../shipping.types";
import { ShippingServiceCalculateCost } from "./calculate-cost";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location", () => ({
  LocationServiceLookup: jest.fn(),
}));

describe("ShippingServiceCalculateCost", () => {
  it("should correctly calculate the cost", () => {
    const shipping: Omit<Shipping, "_id" | "cost" | "location"> = {
      origin: getLocationObject({
        distanceHourlyRate: 100,
        fixedRatePerKm: 20,
        distanceForFree: 5,
        startFee: 0,
      }),
      destination: {
        name: faker.person.firstName(),
        fullAddress: faker.location.streetAddress(),
      },
      duration: {
        text: "1 hour",
        value: 60,
      },
      distance: { text: "5.3 km", value: 5.3 },
    };

    const actualCost = ShippingServiceCalculateCost(shipping);

    expect(actualCost).toEqual(106);
  });

  it("should correctly calculate the cost with start fee", () => {
    const shipping: Omit<Shipping, "_id" | "cost" | "location"> = {
      origin: getLocationObject({
        distanceHourlyRate: 100,
        fixedRatePerKm: 20,
        distanceForFree: 5,
        startFee: 400,
      }),
      destination: {
        name: faker.person.firstName(),
        fullAddress: faker.location.streetAddress(),
      },
      duration: {
        text: "1 hour",
        value: 60,
      },
      distance: { text: "5.3 km", value: 5.3 },
    };

    const actualCost = ShippingServiceCalculateCost(shipping);

    expect(actualCost).toEqual(506);
  });
});
