import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { omitObjectIdProps } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import { CustomerLocationServiceCreate } from "./create";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services/get-coordinates", () => ({
  LocationServiceGetCoordinates: jest.fn(),
}));

type LocationServiceGetCoordinatesMock = jest.Mock<
  Promise<{
    longitude: number;
    latitude: number;
    fullAddress: string;
    city: string;
    country: string;
  }>
>;

const mockGetCoordinates =
  LocationServiceGetCoordinates as LocationServiceGetCoordinatesMock;

const customerId = 1;

describe("CustomerLocationServiceCreate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("create should be able to create origin", async () => {
    const coordinates = {
      longitude: 10.12961271,
      latitude: 56.15563438,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      city: "Aarhus",
      country: "Denmark",
    };

    mockGetCoordinates.mockResolvedValue(coordinates);

    const location = getLocationObject({
      name: "Falafel",
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      originType: LocationOriginTypes.COMMERCIAL,
      locationType: LocationTypes.ORIGIN,
      customerId,
      distanceHourlyRate: 1,
      fixedRatePerKm: 10,
      distanceForFree: 10,
    });

    const response = await CustomerLocationServiceCreate(location);

    expect(omitObjectIdProps(response.toObject())).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.ORIGIN,
        customerId: 1,
        fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
        geoLocation: { coordinates: [10.12961271, 56.15563438], type: "Point" },
      })
    );
  });

  it("create should be able to create destination", async () => {
    const coordinates = {
      longitude: 123.45,
      latitude: 67.89,
      fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
      city: "Aarhus",
      country: "Denmark",
    };

    mockGetCoordinates.mockResolvedValue(coordinates);

    const location = getLocationObject({
      name: "remote",
      fullAddress: "Sigridsvej 45 1, 8220 Brabrand",
      locationType: LocationTypes.DESTINATION,
      originType: LocationOriginTypes.COMMERCIAL,
      distanceHourlyRate: 1,
      fixedRatePerKm: 10,
      distanceForFree: 10,
      customerId,
    });

    const response = await CustomerLocationServiceCreate(location);

    expect(omitObjectIdProps(response.toObject())).toEqual(
      expect.objectContaining({
        locationType: LocationTypes.DESTINATION,
        customerId: 1,
        distanceHourlyRate: 1,
        fixedRatePerKm: 10,
        distanceForFree: 10,
      })
    );
  });
});
