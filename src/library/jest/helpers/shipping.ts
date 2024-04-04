import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { Location } from "~/functions/location/location.types";
import { ShippingModel } from "~/functions/shipping/shipping.model";
import { Shipping } from "~/functions/shipping/shipping.types";
import { getLocationObject } from "./location";

export const DEFAULT_GROUP = "all";

export const createShipping = (
  filter: Partial<Omit<Shipping, "origin">> & { origin?: Partial<Location> }
) => {
  const shipping = new ShippingModel();
  shipping.location =
    filter.location?.toString() || new mongoose.Types.ObjectId();
  shipping.origin = getLocationObject(filter.origin || {});
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
