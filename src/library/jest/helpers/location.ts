import { faker } from "@faker-js/faker";
import {
  Location,
  LocationDestination,
  LocationModel,
  LocationOriginTypes,
  LocationTypes,
} from "~/functions/location";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getLocationOriginObject = (
  props: Partial<Location> = {}
): Location => ({
  name: faker.name.firstName(),
  customerId: 1,
  locationType: LocationTypes.ORIGIN,
  originType: LocationOriginTypes.COMMERCIAL,
  fullAddress: faker.address.streetAddress(),
  ...props,
});

export const getLocationDestinationObject = (
  props: Partial<LocationDestination> = {}
): LocationDestination => ({
  name: faker.name.firstName(),
  customerId: 1,
  locationType: LocationTypes.DESTINATION,
  originType: LocationOriginTypes.COMMERCIAL,
  fullAddress: faker.address.streetAddress(),
  distanceHourlyRate: faker.datatype.number({ min: 1, max: 5 }),
  fixedRatePerKm: faker.datatype.number({ min: 1, max: 5 }),
  minDistanceForFree: faker.datatype.number({ min: 1, max: 5 }),
  ...props,
});

export const createLocationOrigin = (
  filter: Pick<User, "customerId">,
  props: Partial<Location> = {}
) => {
  const location = new LocationModel(
    getLocationOriginObject({ ...filter, ...props })
  );
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [
    parseFloat(faker.address.latitude()),
    parseFloat(faker.address.longitude()),
  ];
  location.handle = faker.internet.userName();
  return location.save();
};

export const createLocationDestination = (
  filter: Pick<User, "customerId">,
  props: Partial<LocationDestination> = {}
) => {
  const location = new LocationModel(
    getLocationDestinationObject({ ...filter, ...props })
  );
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [
    parseFloat(faker.address.latitude()),
    parseFloat(faker.address.longitude()),
  ];
  location.handle = faker.internet.userName();
  return location.save();
};
