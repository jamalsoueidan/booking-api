import mongoose from "mongoose";
import { LocationServiceGet } from "~/functions/location/services/get";
import { LocationServiceGetTravelTime } from "~/functions/location/services/get-travel-time";
import { getLocationObject } from "~/library/jest/helpers/location";
import { ShippingServiceCreate } from "./create";

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
      ...getLocationObject(),
    } as Awaited<ReturnType<typeof LocationServiceGet>>),
  };
});

describe("ShippingService", () => {
  it("should be able to create shipping", async () => {
    const shipping = await ShippingServiceCreate({
      customerId: 1,
      locationId: new mongoose.Types.ObjectId(),
      destination: {
        name: "test",
        fullAddress: "dortesvej 21 1 th, 8220 Brabrand",
      },
    });

    expect(shipping).toBeDefined();
  });
});
