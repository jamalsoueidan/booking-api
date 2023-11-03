import { Shipping } from "../shipping.types";

export const ShippingServiceCalculateCost = ({
  duration: { value: duration },
  distance: { value: distance },
  origin,
}: Omit<Shipping, "_id" | "location" | "destination" | "cost">) => {
  const { distanceForFree, fixedRatePerKm, distanceHourlyRate, startFee } =
    origin;

  // Calculate the chargeable distance.
  const chargeableDistance = Math.max(0, distance - distanceForFree);

  // Calculate the cost for the distance.
  const distanceCost = chargeableDistance * fixedRatePerKm;

  // Calculate the cost for the duration.
  const durationInHours = duration / 60;
  const durationCost = durationInHours * distanceHourlyRate;

  // Total cost is the sum of the cost for the distance, the duration, and start fee.
  const totalCost = distanceCost + durationCost + startFee;

  return Math.round(totalCost);
};
