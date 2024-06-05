import { faker } from "@faker-js/faker";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { createLocation } from "~/library/jest/helpers/location";
import { CustomerLocationServiceUpdate } from "./update";

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

describe("CustomerLocationServiceUpdate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("update should be able to update destination", async () => {
    const customerId = faker.number.int();

    const document = await createLocation({ customerId });

    const coordinates = {
      longitude: 10.12961271,
      latitude: 56.15563438,
      fullAddress: "Sigridsvej 4, 1. th, 8220 Brabrand",
      city: "Aarhus",
      country: "Denmark",
    };

    mockGetCoordinates.mockResolvedValue(coordinates);

    const update = await CustomerLocationServiceUpdate(
      { locationId: document._id, customerId },
      {
        name: "test",
        fullAddress: coordinates.fullAddress,
        distanceHourlyRate: 5,
        fixedRatePerKm: 5,
        distanceForFree: 5,
      }
    );

    expect(update.geoLocation.coordinates).toEqual([
      coordinates.longitude,
      coordinates.latitude,
    ]);
  });
});
