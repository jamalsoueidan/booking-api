import mongoose from "mongoose";
import { NotFoundError } from "~/library/handler";
import { LocationModel } from "../location.model";
import { Location } from "../location.types";
import { ILocation, ILocationDocument } from "../schemas";
import { LocationServiceValidateAddress } from "./validate-address";

export type LocationUpdateFilterProps = {
  locationId: ILocationDocument["_id"];
  customerId: Location["customerId"];
};

export type LocationUpdateBody = Partial<ILocation>;

export const LocationServiceUpdate = async (
  filter: LocationUpdateFilterProps,
  body: LocationUpdateBody
) => {
  if (body.fullAddress) {
    const existingLocation = await LocationModel.findOne({
      _id: new mongoose.Types.ObjectId(filter.locationId),
      customerId: filter.customerId,
    });

    if (!existingLocation) {
      throw new NotFoundError([
        {
          code: "custom",
          message: "LOCATION_NOT_FOUND",
          path: ["location"],
        },
      ]);
    }

    if (body.fullAddress !== existingLocation.fullAddress) {
      const result = await LocationServiceValidateAddress(
        body.fullAddress,
        filter.locationId.toString()
      );

      body = {
        ...body,
        fullAddress: result.fullAddress,
        geoLocation: {
          type: "Point",
          coordinates: [result.longitude, result.latitude],
        },
        handle: createSlug(body.name || existingLocation.name),
      };
    }
  }

  const updatedLocation = await LocationModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(filter.locationId),
      customerId: filter.customerId,
    },
    body,
    { new: true }
  );

  if (!updatedLocation) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "LOCATION_NOT_FOUND",
        path: ["location"],
      },
    ]);
  }

  return updatedLocation;
};

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}
