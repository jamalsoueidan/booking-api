import { LocationModel } from "~/functions/location";
import { shopifyAdmin } from "~/library/shopify";
import { StringOrObjectIdType } from "~/library/zod";

export const createLocationMetafieldName = "createLocationMetafield";
export const createLocationMetafield = async ({
  locationId,
}: {
  locationId: StringOrObjectIdType;
}) => {
  const location = await LocationModel.findById(locationId);

  if (!location) {
    throw new Error(
      `Failed to find locations to create metafield ${locationId}`
    );
  }

  const { data } = await shopifyAdmin().request(CREATE_LOCATION_METAOBJECT, {
    variables: {
      handle: location._id,
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
      ],
    },
  });

  if (!data?.metaobjectCreate?.metaobject) {
    throw new Error(`Failed to create metafield for location ${location}`);
  }

  location.metafieldId = data?.metaobjectCreate?.metaobject?.id;
  await location.save();

  return data.metaobjectCreate.metaobject;
};

export const CREATE_LOCATION_METAOBJECT = `#graphql
  mutation CreateLocationMetaobject($handle: String!, $fields: [MetaobjectFieldInput!]) {
    metaobjectCreate(
      metaobject: {type: "location", fields: $fields, handle: $handle, capabilities: {publishable: {status: ACTIVE}}}
    ) {
      metaobject {
        id
        type
        fields {
          value
          key
        }
      }
    }
  }
` as const;
