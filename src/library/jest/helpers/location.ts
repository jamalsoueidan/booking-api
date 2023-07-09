import { faker } from "@faker-js/faker";
import {
  Location,
  LocationModel,
  LocationOriginTypes,
  LocationTypes,
} from "~/functions/location";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getLocationObject = (props: Partial<Location> = {}): Location => ({
  name: faker.name.firstName(),
  customerId: faker.datatype.number({ min: 1, max: 100000 }),
  locationType: LocationTypes.ORIGIN,
  originType: LocationOriginTypes.COMMERCIAL,
  fullAddress: faker.address.streetAddress(),
  distanceHourlyRate: faker.datatype.number({ min: 1, max: 5 }),
  fixedRatePerKm: faker.datatype.number({ min: 1, max: 5 }),
  minDistanceForFree: faker.datatype.number({ min: 1, max: 5 }),
  ...props,
});

export const createLocation = (
  filter: Pick<User, "customerId"> & Partial<Location>
) => {
  const location = new LocationModel(getLocationObject(filter));
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [
    parseFloat(faker.address.latitude()),
    parseFloat(faker.address.longitude()),
  ];
  location.handle = faker.internet.userName();
  return location.save();
};
