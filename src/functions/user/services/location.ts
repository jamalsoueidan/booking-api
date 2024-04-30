import { LocationModel } from "~/functions/location";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";
import { UserServiceGet } from "./user/get";

export const UserLocationServiceGetOne = async ({
  username,
  locationId,
}: {
  username: string;
  locationId: StringOrObjectIdType;
}) => {
  const user = await UserServiceGet({ username });
  return LocationModel.findOne({
    _id: locationId.toString(),
    customerId: user.customerId,
    deletedAt: null,
  }).orFail(
    new NotFoundError([
      {
        path: ["locationId", "username"],
        message: "LOCATION_NOT_FOUND_IN_USER",
        code: "custom",
      },
    ])
  );
};
