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
  await UserServiceLocationsAdd(location);
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

export const CustomerLocationServiceGetAll = (
  props: Pick<CustomerLocationServiceProps, "customerId">
) => {
  return UserServiceGetLocations(props);
};

export const CustomerLocationServiceGetOne = async (
  props: CustomerLocationServiceProps
) => {
  const locations = await UserServiceGetLocations(props);
  const location = locations.find(
    (l) => l._id.toString() === props.locationId.toString()
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
