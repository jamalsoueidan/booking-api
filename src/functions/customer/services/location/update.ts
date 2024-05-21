import mongoose from "mongoose";
import { ILocation, LocationModel } from "~/functions/location";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { StringOrObjectIdType } from "~/library/zod";

export type CustomerLocationUpdateFilterProps = {
  locationId: StringOrObjectIdType;
  customerId: number;
};

export type CustomerLocationUpdateBody = Partial<ILocation>;

export const CustomerLocationServiceUpdate = async (
  filter: CustomerLocationUpdateFilterProps,
  body: CustomerLocationUpdateBody
) => {
  const location = await LocationModel.findOne({
    _id: new mongoose.Types.ObjectId(filter.locationId),
    customerId: filter.customerId,
  }).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "LOCATION_NOT_FOUND",
        path: ["location"],
      },
    ])
  );

  if (body.fullAddress && body.fullAddress !== location.fullAddress) {
    const result = await LocationServiceGetCoordinates({
      fullAddress: body.fullAddress,
    });

    body = {
      ...body,
      fullAddress: result.fullAddress,
      city: result.city,
      country: result.country,
      geoLocation: {
        type: "Point",
        coordinates: [result.longitude, result.latitude],
      },
    };
  }

  const updateLocation = await LocationModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(filter.locationId),
      customerId: filter.customerId,
    },
    body,
    { returnOriginal: false }
  ).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "LOCATION_NOT_FOUND",
        path: ["location"],
      },
    ])
  );

  if (updateLocation.metafieldId) {
    await shopifyAdmin.request(UPDATE_LOCATION_METAOBJECT, {
      variables: {
        id: updateLocation.metafieldId,
        fields: [
          {
            key: "location_type",
            value: updateLocation.locationType,
          },
          {
            key: "name",
            value: updateLocation.name,
          },
          {
            key: "full_address",
            value: updateLocation.fullAddress,
          },
          {
            key: "city",
            value: updateLocation.city,
          },
          {
            key: "country",
            value: updateLocation.country,
          },
          {
            key: "origin_type",
            value: updateLocation.originType,
          },
          {
            key: "distance_for_free",
            value: updateLocation.distanceForFree.toString(),
          },
          {
            key: "distance_hourly_rate",
            value: updateLocation.distanceHourlyRate.toString(),
          },
          {
            key: "fixed_rate_per_km",
            value: updateLocation.fixedRatePerKm.toString(),
          },
          {
            key: "min_drive_distance",
            value: updateLocation.minDriveDistance.toString(),
          },
          {
            key: "max_drive_distance",
            value: updateLocation.maxDriveDistance.toString(),
          },
          {
            key: "start_fee",
            value: updateLocation.startFee.toString(),
          },
        ],
      },
    });
  }

  return updateLocation;
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
