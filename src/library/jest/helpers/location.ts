import { faker } from "@faker-js/faker";
import {
  LocationDestination,
  LocationDestinationModel,
  LocationDestinationTypes,
  LocationOrigin,
  LocationOriginModel,
} from "~/functions/location";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getLocationOriginObject = (
  props: Partial<LocationOrigin> = {}
): LocationOrigin => ({
  name: faker.name.firstName(),
  destinationType: LocationDestinationTypes.COMMERCIAL,
  fullAddress: faker.address.streetAddress(),
  ...props,
});

export const getLocationDestinationObject = (
  props: Partial<LocationDestination> = {}
): LocationDestination => ({
  name: faker.name.firstName(),
  distanceHourlyRate: faker.datatype.number({ min: 1, max: 5 }),
  fixedRatePerKm: faker.datatype.number({ min: 1, max: 5 }),
  minDistanceForFree: faker.datatype.number({ min: 1, max: 5 }),
  ...props,
});

export const createLocationOrigin = (
  filter: Pick<User, "customerId">,
  props: Partial<LocationOrigin> = {}
) => {
  const location = new LocationOriginModel({
    ...filter,
    ...getLocationOriginObject(props),
  });
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
  const location = new LocationDestinationModel({
    ...filter,
    ...getLocationOriginObject(props),
  });
  return location.save();
};
