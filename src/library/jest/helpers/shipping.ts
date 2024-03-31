import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import {
  Location,
  LocationOriginTypes,
  LocationTypes,
} from "~/functions/location/location.types";
import { ShippingModel } from "~/functions/shipping/shipping.model";
import { Shipping } from "~/functions/shipping/shipping.types";

export const DEFAULT_GROUP = "all";

const getOriginObject = (props: Partial<Location> = {}): Location => ({
  name: faker.person.firstName(),
  customerId: props.customerId || faker.number.int({ min: 1, max: 100000 }),
  locationType: LocationTypes.ORIGIN,
  originType: LocationOriginTypes.COMMERCIAL,
  fullAddress: faker.location.streetAddress(),
  distanceHourlyRate: faker.number.int({ min: 1, max: 5 }),
  fixedRatePerKm: faker.number.int({ min: 1, max: 5 }),
  distanceForFree: faker.number.int({ min: 1, max: 5 }),
  maxDriveDistance: 500,
  minDriveDistance: 0,
  startFee: 0,
  ...props,
});

export const createShipping = (
  filter: Partial<Omit<Shipping, "origin">> & { origin: Partial<Location> }
) => {
  const shipping = new ShippingModel();
  shipping.location =
    filter.location?.toString() || new mongoose.Types.ObjectId();
  shipping.origin = getOriginObject(filter.origin || {});
  shipping.destination = {
    name: faker.company.buzzPhrase(),
    fullAddress: faker.location.streetAddress(),
  };
  shipping.duration = filter.duration || {
    text: "2 hours 59 mins",
    value: 179.31666666666666,
  };
  shipping.distance = {
    text: "187 km",
    value: 186.586,
  };
  shipping.cost = {
    currency: "DKK",
    value: 123,
  };
  return shipping.save();
};
