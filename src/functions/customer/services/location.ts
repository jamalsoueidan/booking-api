import { Location } from "~/functions/location";
import {
  LocationServiceCreate,
  LocationServiceCreateProps,
  LocationServiceUpdate,
  LocationUpdateBody,
  LocationUpdateFilterProps,
} from "~/functions/location/services";
import {
  UserServiceLocationsAdd,
  UserServiceLocationsRemove,
  UserServiceLocationsSetDefault,
} from "~/functions/user";

export const CustomerLocationCreate = async (
  body: LocationServiceCreateProps
) => {
  const location = await LocationServiceCreate(body);
  await UserServiceLocationsAdd(location);
  return location;
};

export const CustomerLocationUpdate = (
  filter: LocationUpdateFilterProps,
  body: LocationUpdateBody
) => {
  return LocationServiceUpdate(filter, body);
};

export type CustomerLocationCustomerProps = {
  locationId: Location["_id"];
  customerId: Location["customerId"];
};

export const CustomerLocationSetDefault = (
  location: CustomerLocationCustomerProps
) => {
  return UserServiceLocationsSetDefault({
    _id: location.locationId,
    customerId: location.customerId,
  });
};

export const CustomerLocationAdd = (
  location: CustomerLocationCustomerProps
) => {
  return UserServiceLocationsAdd({
    _id: location.locationId,
    customerId: location.customerId,
  });
};

export const CustomerLocationRemove = (
  location: CustomerLocationCustomerProps
) => {
  return UserServiceLocationsRemove({
    _id: location.locationId,
    customerId: location.customerId,
  });
};
