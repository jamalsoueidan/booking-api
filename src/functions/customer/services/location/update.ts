import mongoose from "mongoose";
import { ILocation, LocationModel } from "~/functions/location";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { NotFoundError } from "~/library/handler";
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

  return await LocationModel.findOneAndUpdate(
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
};
