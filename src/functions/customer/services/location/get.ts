import { LocationModel } from "~/functions/location";

import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type CustomerLocationServiceGetProps = {
  locationId: StringOrObjectId;
  customerId: number;
};

export const CustomerLocationServiceGet = async (
  props: CustomerLocationServiceGetProps
) => {
  return LocationModel.findOne({
    _id: props.locationId,
    customerId: props.customerId,
    deletedAt: null,
  }).orFail(
    new NotFoundError([
      {
        path: ["locationId", "customerId"],
        message: "LOCATION_NOT_FOUND_IN_USER",
        code: "custom",
      },
    ])
  );
};
