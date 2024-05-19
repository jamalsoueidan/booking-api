import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { omitObjectIdProps } from "~/library/jest/helpers";
import { getLocationObject } from "~/library/jest/helpers/location";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import {
  CreateLocationMetaobjectMutation,
  CreateLocationMetaobjectMutationVariables,
} from "~/types/admin.generated";
import {
  CREATE_LOCATION_METAOBJECT,
  CustomerLocationServiceCreate,
} from "./create";

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

    mockRequest.mockResolvedValueOnce({
      data: ensureType<CreateLocationMetaobjectMutation>({
        metaobjectCreate: {
          metaobject: {
            id: "gid://shopify/Metaobject/77850968391",
            type: "location",
            fields: [
              {
                value: location.locationType,
                key: "location_type",
              },
              {
                value: location.name,
                key: "name",
              },
              {
                value: location.fullAddress,
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
                value: location.originType,
                key: "origin_type",
              },
              {
                value: location.distanceForFree.toString(),
                key: "distance_for_free",
              },
              {
                value: location.distanceHourlyRate.toString(),
                key: "distance_hourly_rate",
              },
              {
                value: location.fixedRatePerKm.toString(),
                key: "fixed_rate_per_km",
              },
              {
                value: location.minDriveDistance.toString(),
                key: "min_drive_distance",
              },
              {
                value: location.maxDriveDistance.toString(),
                key: "max_drive_distance",
              },
              {
                value: location.startFee.toString(),
                key: "start_fee",
              },
            ],
          },
        },
      }),
    });

    const response = await CustomerLocationServiceCreate(location);

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(1);

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      CREATE_LOCATION_METAOBJECT,
      {
        variables: ensureType<CreateLocationMetaobjectMutationVariables>({
          handle: response._id,
          fields: [
            {
              value: response.locationType,
              key: "location_type",
            },
            {
              value: response.name,
              key: "name",
            },
            {
              value: response.fullAddress,
              key: "full_address",
            },
            {
              value: response.city,
              key: "city",
            },
            {
              value: response.country,
              key: "country",
            },
            {
              value: response.originType,
              key: "origin_type",
            },
            {
              value: response.distanceForFree.toString(),
              key: "distance_for_free",
            },
            {
              value: response.distanceHourlyRate.toString(),
              key: "distance_hourly_rate",
            },
            {
              value: response.fixedRatePerKm.toString(),
              key: "fixed_rate_per_km",
            },
            {
              value: response.minDriveDistance.toString(),
              key: "min_drive_distance",
            },
            {
              value: response.maxDriveDistance.toString(),
              key: "max_drive_distance",
            },
            {
              value: response.startFee.toString(),
              key: "start_fee",
            },
          ],
        }),
      }
    );

    expect(omitObjectIdProps(response.toObject())).toEqual(
      expect.objectContaining({
        metafieldId: "gid://shopify/Metaobject/77850968391",
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

    mockRequest.mockResolvedValueOnce({
      data: ensureType<CreateLocationMetaobjectMutation>({
        metaobjectCreate: {
          metaobject: {
            id: "gid://shopify/Metaobject/77850968391",
            type: "location",
            fields: [
              {
                value: location.locationType,
                key: "location_type",
              },
              {
                value: location.name,
                key: "name",
              },
              {
                value: location.fullAddress,
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
                value: location.originType,
                key: "origin_type",
              },
              {
                value: location.distanceForFree.toString(),
                key: "distance_for_free",
              },
              {
                value: location.distanceHourlyRate.toString(),
                key: "distance_hourly_rate",
              },
              {
                value: location.fixedRatePerKm.toString(),
                key: "fixed_rate_per_km",
              },
              {
                value: location.minDriveDistance.toString(),
                key: "min_drive_distance",
              },
              {
                value: location.maxDriveDistance.toString(),
                key: "max_drive_distance",
              },
              {
                value: location.startFee.toString(),
                key: "start_fee",
              },
            ],
          },
        },
      }),
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
