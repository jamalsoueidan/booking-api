import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { createLocation } from "~/library/jest/helpers/location";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import {
  CreateLocationMetaobjectMutation,
  CreateLocationMetaobjectMutationVariables,
} from "~/types/admin.generated";
import {
  CREATE_LOCATION_METAOBJECT,
  createLocationMetafield,
} from "./create-location-metafield";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateUserMetaobject", async () => {
    const coordinates = {
      longitude: 10.12961271,
      latitude: 56.15563438,
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      city: "Aarhus",
      country: "Denmark",
    };

    const location = await createLocation({
      name: "Falafel",
      fullAddress: "Sigridsvej 45, 1. th, 8220 Brabrand",
      originType: LocationOriginTypes.COMMERCIAL,
      locationType: LocationTypes.ORIGIN,
      customerId: 12,
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

    await createLocationMetafield({ locationId: location._id });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, CREATE_LOCATION_METAOBJECT, {
      variables: ensureType<CreateLocationMetaobjectMutationVariables>({
        handle: location._id,
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
            value: location.city,
            key: "city",
          },
          {
            value: location.country,
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
      }),
    });
  });
});
