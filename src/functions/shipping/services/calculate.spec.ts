import { LocationServiceGet } from "~/functions/location/services/get";
import { LocationServiceGetTravelTime } from "~/functions/location/services/get-travel-time";
import { createLocation } from "~/library/jest/helpers/location";
import { ShippingServiceCalculate } from "./calculate";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services/get-travel-time", () => ({
  LocationServiceGetTravelTime: jest.fn(),
}));

jest.mock("~/functions/location/services/get", () => ({
  LocationServiceGet: jest.fn(),
}));

describe("ShippingServiceCalculate", () => {
  it("should calculate destination from locationId", async () => {
    const location = await createLocation({
      locationType: "destination" as any,
      customerId: 1,
      distanceHourlyRate: 200,
      fixedRatePerKm: 2,
      distanceForFree: 0,
    });

    (LocationServiceGet as jest.Mock).mockResolvedValue(location);

    (LocationServiceGetTravelTime as jest.Mock).mockResolvedValue({
      duration: {
        text: "120 min",
        value: 120,
      },
      distance: {
        text: "100 km",
        value: 100,
      },
    } as Awaited<ReturnType<typeof LocationServiceGetTravelTime>>);

    const request = {
      locationId: location._id,
      destination: {
        name: "hotel a",
        fullAddress: "Dortesvej 17 1 th",
      },
    };

    const response = await ShippingServiceCalculate(request);

    expect(response).toEqual(
      expect.objectContaining({
        duration: { text: "120 min", value: 120 },
        distance: { text: "100 km", value: 100 },
        cost: { value: 600, currency: "DKK" },
      })
    );
  });

  it("should throw error since maxDriveDistance 50, and distance is 100", async () => {
    const location = await createLocation({
      locationType: "destination" as any,
      customerId: 1,
      distanceHourlyRate: 200,
      fixedRatePerKm: 2,
      minDriveDistance: 20,
      maxDriveDistance: 50,
      distanceForFree: 0,
    });

    (LocationServiceGet as jest.Mock).mockResolvedValue(location);

    (LocationServiceGetTravelTime as jest.Mock).mockResolvedValue({
      duration: {
        text: "120 min",
        value: 120,
      },
      distance: {
        text: "100 km",
        value: 100,
      },
    } as Awaited<ReturnType<typeof LocationServiceGetTravelTime>>);

    await expect(
      ShippingServiceCalculate({
        locationId: location._id,
        destination: {
          name: "hotel c",
          fullAddress: "Dortesvej 17 1 th",
        },
      })
    ).rejects.toThrowError();
  });

  it("should throw error since minDriveDistance is 40, and distance is 30", async () => {
    const location = await createLocation({
      locationType: "destination" as any,
      customerId: 1,
      distanceHourlyRate: 200,
      fixedRatePerKm: 2,
      minDriveDistance: 40,
      maxDriveDistance: 500,
      distanceForFree: 0,
    });

    (LocationServiceGet as jest.Mock).mockResolvedValue(location);

    (LocationServiceGetTravelTime as jest.Mock).mockResolvedValue({
      duration: {
        text: "120 min",
        value: 120,
      },
      distance: {
        text: "100 km",
        value: 30,
      },
    } as Awaited<ReturnType<typeof LocationServiceGetTravelTime>>);

    await expect(
      ShippingServiceCalculate({
        locationId: location._id,
        destination: {
          name: "hotel c",
          fullAddress: "Dortesvej 17 1 th",
        },
      })
    ).rejects.toThrowError();
  });
});
