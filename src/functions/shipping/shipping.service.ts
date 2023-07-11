import { Lookup, LookupModel } from "../lookup";
import { ShippingBody } from "./shipping.types";

export const ShippingServiceCalculateCost = ({
  duration: { value: duration },
  distance: { value: distance },
  origin,
}: Omit<Lookup, "_id">) => {
  const { minDistanceForFree, fixedRatePerKm, distanceHourlyRate } = origin;

  // Convert distance from meters to kilometers.
  const distanceInKm = distance / 1000;

  // Calculate the chargeable distance.
  const chargeableDistance = Math.max(0, distanceInKm - minDistanceForFree);

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
    .filter((id) => typeof id === "number"); // Ensure only numbers

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
    _id: { $in: lookupIds },
  });

  const prices = lookups.map((l) => ShippingServiceCalculateCost(l));

  const totalPrices = prices.reduce((total, price) => total + price, 0);

  return {
    rates: [
      {
        service_name: `${lookups.length} skønhedseksperter til din lokation`,
        service_code: "ETON",
        total_price: totalPrices,
        currency: "DKK",
        min_delivery_date: onMinDate,
        max_delivery_date: onMaxDate,
      },
    ],
  };
};
