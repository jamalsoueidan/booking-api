import { Location } from "~/functions/location";
import {
  LocationServiceCreate,
  LocationServiceCreateProps,
  LocationServiceUpdate,
  LocationUpdateBody,
  LocationUpdateFilterProps,
} from "~/functions/location/services";
import {
  UserServiceGetLocations,
  UserServiceLocationsAdd,
  UserServiceLocationsRemove,
  UserServiceLocationsSetDefault,
} from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export const CustomerLocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  const location = await LocationServiceCreate(body);
  await UserServiceLocationsAdd({
    _id: location._id.toString(),
    customerId: location.customerId,
  });
  return location;
};

export const CustomerLocationServiceUpdate = (
  filter: LocationUpdateFilterProps,
  body: LocationUpdateBody
) => {
  return LocationServiceUpdate(filter, body);
};

export type CustomerLocationServiceProps = {
  locationId: Location["_id"];
  customerId: Location["customerId"];
};

export const CustomerLocationServiceSetDefault = (
  location: CustomerLocationServiceProps
) => {
  return UserServiceLocationsSetDefault({
    _id: location.locationId,
    customerId: location.customerId,
  });
};

export const CustomerLocationServiceAdd = (
  location: CustomerLocationServiceProps
) => {
  return UserServiceLocationsAdd({
    _id: location.locationId,
    customerId: location.customerId,
  });
};

export const CustomerLocationServiceRemove = (
  location: CustomerLocationServiceProps
) => {
  return UserServiceLocationsRemove({
    _id: location.locationId,
    customerId: location.customerId,
  });
};

export const CustomerLocationServiceGetAll = <T>(
  props: Pick<CustomerLocationServiceProps, "customerId">
) => {
  return UserServiceGetLocations<T>(props);
};

export const CustomerLocationServiceGetOne = async <T>(
  props: CustomerLocationServiceProps
) => {
  const locations = await UserServiceGetLocations<T>(props);
  const location = locations.find(
    (l) => l.location.toString() === props.locationId.toString()
  );
  if (!location) {
    new NotFoundError([
      {
        path: ["locationId", "customerId"],
        message: "LOCATION_NOT_FOUND_IN_USER",
        code: "custom",
      },
    ]);
  }
  return location;
};
