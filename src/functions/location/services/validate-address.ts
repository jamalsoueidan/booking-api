import { BadError } from "~/library/handler";
import { LocationModel } from "../location.model";
import { LocationServiceGetCoordinates } from "./get-coordinates";

export const LocationServiceValidateAddress = async (
  fullAddress: string,
  excludeLocationId?: string
) => {
  const response = await LocationServiceGetCoordinates({ fullAddress });
  const query: Record<string, any> = {
    $or: [{ fullAddress: response.fullAddress }],
  };

  if (excludeLocationId) {
    query["_id"] = { $ne: excludeLocationId };
  }

  const location = await LocationModel.findOne(query);

  if (location) {
    throw new BadError([
      {
        code: "custom",
        message: "LOCATION_ALREADY_EXIST",
        path: ["fullAddress"],
      },
    ]);
  }

  return response;
};
