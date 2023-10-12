import mongoose from "mongoose";
import {
  LocationServiceLookup,
  LocationServiceLookupProps,
} from "~/functions/location";
import { NotFoundError } from "~/library/handler";
import { Lookup, LookupModel } from "../lookup";
import { ShippingBody } from "./shipping.types";

export const ShippingServiceCalculateCost = ({
  duration: { value: duration },
  distance: { value: distance },
  origin,
}: Omit<Lookup, "_id" | "destination">) => {
  const { distanceForFree, fixedRatePerKm, distanceHourlyRate } = origin;

  // Calculate the chargeable distance.
  const chargeableDistance = Math.max(0, distance - distanceForFree);

  // Calculate the cost for the distance.
  const distanceCost = chargeableDistance * fixedRatePerKm;

  // Calculate the cost for the duration.
  const durationInHours = duration / 60;
  const durationCost = durationInHours * distanceHourlyRate;

  // Total cost is the sum of the cost for the distance and the duration.
  const totalCost = distanceCost + durationCost;

  return Math.round(totalCost);
};

export const ShippingServiceGet = async (body: ShippingBody) => {
  let lookupIds = body.items
    .map((item) => item.properties?._lookupId)
    .filter((id) => typeof id === "string"); // Ensure only numbers

  lookupIds = [...new Set(lookupIds)];

  const onMinDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
  const onMaxDate = new Date(Date.now() + 2 * 86400000).toISOString(); // +2 days

  if (!lookupIds.length) {
    return {
      rates: [
        {
          service_name: `Gratis leverings`,
          service_code: "ETON",
          total_price: 0,
          currency: "DKK",
          min_delivery_date: onMinDate,
          max_delivery_date: onMaxDate,
        },
      ],
    };
  }

  const lookups = await LookupModel.find({
    _id: { $in: lookupIds.map((l) => new mongoose.Types.ObjectId(l)) },
  });

  const prices = lookups.map((l) => ShippingServiceCalculateCost(l));

  const totalPrices = prices.reduce((total, price) => total + price, 0);

  return {
    rates: [
      {
        service_name: `${lookups.length} skønhedseksperter til din lokation`,
        description: "Inkludere alle udgifter",
        service_code: "ETON",
        total_price: totalPrices * 100,
        currency: "DKK",
        phone_required: true,
        //min_delivery_date: onMinDate,
        //max_delivery_date: onMaxDate,
      },
    ],
  };
};

export const ShippingServiceCalculate = async (
  props: Required<LocationServiceLookupProps>
) => {
  const lookup = await LocationServiceLookup(props);
  if (!lookup) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "LOOKUP_NOT_FOUND",
        path: ["locationId"],
      },
    ]);
  }

  const cost = ShippingServiceCalculateCost({
    ...lookup?.travelTime,
    origin: lookup?.location,
  });

  return {
    ...lookup.travelTime,
    cost: {
      value: cost,
      currency: "DKK",
    },
  };
};
