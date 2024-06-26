import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { LocationModel } from "~/functions/location/location.model";
import { Location, LocationTypes } from "~/functions/location/location.types";
import { User } from "~/functions/user";

export const DEFAULT_GROUP = "all";

export const getDumbLocationObject = (
  props: Partial<
    Pick<Location, "metafieldId" | "locationType"> & {
      location: any;
    }
  > = {}
) => {
  return {
    metafieldId:
      props.metafieldId || `gid://${faker.number.int({ min: 1, max: 5 })}`,
    location: props.location || new mongoose.Types.ObjectId(),
    locationType: props.locationType || LocationTypes.DESTINATION,
  };
};

export const getLocationObject = (props: Partial<Location> = {}): Location => ({
  metafieldId: "1",
  name: faker.person.firstName(),
  customerId: faker.number.int({ min: 1, max: 100000 }),
  locationType: LocationTypes.HOME,
  fullAddress: faker.location.streetAddress(),
  city: faker.location.city(),
  country: "Denmark",
  distanceHourlyRate: faker.number.int({ min: 1, max: 5 }),
  fixedRatePerKm: faker.number.int({ min: 1, max: 5 }),
  distanceForFree: faker.number.int({ min: 1, max: 5 }),
  maxDriveDistance: 500,
  minDriveDistance: 0,
  startFee: 0,
  ...props,
});

export const createLocation = (
  filter: Pick<User, "customerId"> & Partial<Location>
) => {
  const location = new LocationModel(getLocationObject(filter));
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [
    faker.location.latitude(),
    faker.location.longitude(),
  ];
  location.handle = faker.internet.userName();
  return location.save();
};
