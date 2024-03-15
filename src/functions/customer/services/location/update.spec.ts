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
  }>
>;

const mockGetCoordinates =
  LocationServiceGetCoordinates as LocationServiceGetCoordinatesMock;

describe("CustomerLocationServiceUpdate", () => {
  beforeEach(() => {
    mockGetCoordinates.mockClear();
  });

  it("update should be able to update destination", async () => {
    const customerId = faker.number.int();

    const document = await createLocation({ customerId });

    mockGetCoordinates.mockResolvedValue({
      longitude: 10.12961271,
      latitude: 56.15563438,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
    });

    const update = await CustomerLocationServiceUpdate(
      { locationId: document._id, customerId },
      {
        name: "test",
        fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
        distanceHourlyRate: 5,
        fixedRatePerKm: 5,
        distanceForFree: 5,
      }
    );

    expect(update.geoLocation.coordinates).toEqual([10.12961271, 56.15563438]);
  });
});
