import {
  ILocationDocument,
  Location,
  LocationModel,
} from "~/functions/location";
import { NotFoundError } from "~/library/handler";

export type CustomerLocationServiceProps = {
  locationId: ILocationDocument["_id"];
  customerId: Location["customerId"];
};

export const CustomerLocationServiceSetDefault = (
  location: CustomerLocationServiceProps
) => {
  return LocationModel.updateOne(
    {
      _id: location.locationId,
      customerId: location.customerId,
    },
    {
      isDefault: true,
    }
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
