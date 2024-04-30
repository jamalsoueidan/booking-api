import mongoose from "mongoose";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";
import { LocationModel } from "../location.model";

export type LocationServiceGetProps = {
  locationId: StringOrObjectIdType;
};

export const LocationServiceGet = async ({
  locationId,
}: LocationServiceGetProps) => {
  return LocationModel.findOne({
    _id: new mongoose.Types.ObjectId(locationId),
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "LOCATION_NOT_FOUND",
          path: ["locationId"],
        },
      ])
    )
    .lean();
};
