import mongoose from "mongoose";
import { LocationServiceLookup } from "~/functions/location";
import { getLocationObject } from "~/library/jest/helpers/location";
import { LookupServiceCreate } from "./lookup.service";
require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services", () => {
  return {
    LocationServiceLookup: jest.fn().mockResolvedValueOnce({
      location: {
        _id: new mongoose.Types.ObjectId(),
        ...getLocationObject(),
      },
      travelTime: {
        duration: { text: "14 mins", value: 831 },
        distance: { text: "5.3 km", value: 5342 },
      },
    } as Awaited<ReturnType<typeof LocationServiceLookup>>),
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
