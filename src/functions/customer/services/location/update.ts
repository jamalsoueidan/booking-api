import mongoose from "mongoose";
import { ILocation, LocationModel } from "~/functions/location";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type CustomerLocationUpdateFilterProps = {
  locationId: StringOrObjectId;
  customerId: number;
};

export type CustomerLocationUpdateBody = Partial<ILocation>;

export const CustomerLocationServiceUpdate = async (
  filter: CustomerLocationUpdateFilterProps,
  body: CustomerLocationUpdateBody
) => {
  if (body.fullAddress) {
    const result = await LocationServiceGetCoordinates({
      fullAddress: body.fullAddress,
    });

    body = {
      ...body,
      fullAddress: result.fullAddress,
      geoLocation: {
        type: "Point",
        coordinates: [result.longitude, result.latitude],
      },
    };
  }

  return LocationModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(filter.locationId),
      customerId: filter.customerId,
    },
    body,
    { new: true }
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
