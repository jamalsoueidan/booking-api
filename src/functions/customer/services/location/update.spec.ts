import { faker } from "@faker-js/faker";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { createLocation } from "~/library/jest/helpers/location";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import { UpdateLocationMetaobjectMutation } from "~/types/admin.generated";
import { CustomerLocationServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/functions/location/services/get-coordinates", () => ({
  LocationServiceGetCoordinates: jest.fn(),
}));

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

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

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateLocationMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
              {
                value: document.locationType,
                key: "location_type",
              },
              {
                value: document.name,
                key: "name",
              },
              {
                value: coordinates.fullAddress,
                key: "full_address",
              },
              {
                value: coordinates.city,
                key: "city",
              },
              {
                value: coordinates.country,
                key: "country",
              },
              {
                value: document.originType,
                key: "origin_type",
              },
              {
                value: document.distanceForFree.toString(),
                key: "distance_for_free",
              },
              {
                value: document.distanceHourlyRate.toString(),
                key: "distance_hourly_rate",
              },
              {
                value: document.fixedRatePerKm.toString(),
                key: "fixed_rate_per_km",
              },
              {
                value: document.minDriveDistance.toString(),
                key: "min_drive_distance",
              },
              {
                value: document.maxDriveDistance.toString(),
                key: "max_drive_distance",
              },
              {
                value: document.startFee.toString(),
                key: "start_fee",
              },
            ],
          },
        },
      }),
    });

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
