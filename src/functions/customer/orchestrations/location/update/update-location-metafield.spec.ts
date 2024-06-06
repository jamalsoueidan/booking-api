import { LocationTypes } from "~/functions/location";
import { createLocation } from "~/library/jest/helpers/location";
import { ensureType } from "~/library/jest/helpers/mock";
import { shopifyAdmin } from "~/library/shopify";
import {
  UpdateLocationMetaobjectMutation,
  UpdateLocationMetaobjectMutationVariables,
} from "~/types/admin.generated";
import {
  UPDATE_LOCATION_METAOBJECT,
  updateLocationMetafield,
} from "./update-location-metafield";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerLocationUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateLocationMetafield", async () => {
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
      locationType: LocationTypes.SALON,
      customerId: 12,
      distanceHourlyRate: 1,
      fixedRatePerKm: 10,
      distanceForFree: 10,
    });

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateLocationMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
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
              {
                key: "geo_location",
                value: JSON.stringify(location.geoLocation),
              },
            ],
          },
        },
      }),
    });

    await updateLocationMetafield({ locationId: location._id });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, UPDATE_LOCATION_METAOBJECT, {
      variables: ensureType<UpdateLocationMetaobjectMutationVariables>({
        id: location.metafieldId || "",
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
          {
            key: "geo_location",
            value: JSON.stringify(location.geoLocation),
          },
        ],
      }),
    });
  });
});
