import { Location, LocationModel } from "~/functions/location";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { shopifyAdmin } from "~/library/shopify";

export type LocationServiceCreateProps = Omit<Location, "city" | "country">;

export const CustomerLocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  const result = await LocationServiceGetCoordinates(body);
  const location = new LocationModel(body);
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [result.longitude, result.latitude];
  location.fullAddress = result.fullAddress;
  location.city = result.city;
  location.country = result.country;
  const savedLocation = await location.save();

  const { data } = await shopifyAdmin().request(CREATE_LOCATION_METAOBJECT, {
    variables: {
      handle: location._id,
      fields: [
        {
          key: "location_type",
          value: savedLocation.locationType,
        },
        {
          key: "name",
          value: savedLocation.name,
        },
        {
          key: "full_address",
          value: savedLocation.fullAddress,
        },
        {
          key: "city",
          value: savedLocation.city,
        },
        {
          key: "country",
          value: savedLocation.country,
        },
        {
          key: "origin_type",
          value: savedLocation.originType,
        },
        {
          key: "distance_for_free",
          value: savedLocation.distanceForFree.toString(),
        },
        {
          key: "distance_hourly_rate",
          value: savedLocation.distanceHourlyRate.toString(),
        },
        {
          key: "fixed_rate_per_km",
          value: savedLocation.fixedRatePerKm.toString(),
        },
        {
          key: "min_drive_distance",
          value: savedLocation.minDriveDistance.toString(),
        },
        {
          key: "max_drive_distance",
          value: savedLocation.maxDriveDistance.toString(),
        },
        {
          key: "start_fee",
          value: savedLocation.startFee.toString(),
        },
      ],
    },
  });

  savedLocation.metafieldId = data?.metaobjectCreate?.metaobject?.id;
  return savedLocation.save();
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
