import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";
import { UserServiceGetLocations } from "./user";

export const UserLocationServiceGetOne = async <T>({
  username,
  locationId,
}: {
  username: string;
  locationId: StringOrObjectId;
}) => {
  const locations = await UserServiceGetLocations<T>({ username });
  const location = locations.find(
    (l) => l.location.toString() === locationId.toString()
  );
  if (!location) {
    new NotFoundError([
      {
        path: ["locationId", "username"],
        message: "LOCATION_NOT_FOUND_IN_USER",
        code: "custom",
      },
    ]);
  }
  return location;
};
