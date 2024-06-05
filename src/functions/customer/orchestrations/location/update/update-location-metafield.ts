import { LocationModel } from "~/functions/location";
import { shopifyAdmin } from "~/library/shopify";
import { StringOrObjectIdType } from "~/library/zod";

export const updateLocationMetafieldName = "updateLocationMetafield";
export const updateLocationMetafield = async ({
  locationId,
}: {
  locationId: StringOrObjectIdType;
}) => {
  const location = await LocationModel.findById(locationId);

  if (!location || !location.metafieldId) {
    throw new Error(
      `Failed to find locations to create metafield ${locationId}`
    );
  }

  const { data } = await shopifyAdmin().request(UPDATE_LOCATION_METAOBJECT, {
    variables: {
      id: location.metafieldId,
      fields: [
        {
          key: "location_type",
          value: location.locationType,
        },
        {
          key: "name",
          value: location.name,
        },
        {
          key: "full_address",
          value: location.fullAddress,
        },
        {
          key: "city",
          value: location.city,
        },
        {
          key: "country",
          value: location.country,
        },
        {
          key: "origin_type",
          value: location.originType,
        },
        {
          key: "distance_for_free",
          value: location.distanceForFree.toString(),
        },
        {
          key: "distance_hourly_rate",
          value: location.distanceHourlyRate.toString(),
        },
        {
          key: "fixed_rate_per_km",
          value: location.fixedRatePerKm.toString(),
        },
        {
          key: "min_drive_distance",
          value: location.minDriveDistance.toString(),
        },
        {
          key: "max_drive_distance",
          value: location.maxDriveDistance.toString(),
        },
        {
          key: "start_fee",
          value: location.startFee.toString(),
        },
        {
          key: "geo_location",
          value: JSON.stringify(location.geoLocation),
        },
      ],
    },
  });

  if (!data?.metaobjectUpdate?.metaobject) {
    throw new Error(`Failed to update metafield for location ${location}`);
  }

  return data?.metaobjectUpdate?.metaobject;
};

export const UPDATE_LOCATION_METAOBJECT = `#graphql
  mutation UpdateLocationMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {
      metaobject {
        fields {
          value
          key
        }
      }
    }
  }
` as const;
