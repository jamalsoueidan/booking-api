import {
  LocationServiceGet,
  LocationServiceGetProps,
} from "~/functions/location/services/get";
import { LocationServiceGetTravelTime } from "~/functions/location/services/get-travel-time";
import { NotFoundError } from "~/library/handler";
import { Shipping } from "../shipping.types";
import { ShippingServiceCalculateCost } from "./calculate-cost";

export const ShippingServiceCalculate = async (
  props: Required<LocationServiceGetProps & Pick<Shipping, "destination">>
) => {
  const location = await LocationServiceGet(props); // we should properly use the customerId to find the locationId
  const { destination } = props;

  if (!destination) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "DESTINATION_MISSING",
        path: ["destination"],
      },
    ]);
  }

  const travelTime = await LocationServiceGetTravelTime({
    origin: location.fullAddress,
    destination: destination.fullAddress,
  });

  if (location.minDriveDistance > travelTime.distance.value) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "MIN_DRIVE_DISTANCE_EXCEEDED",
        path: ["minDriveDistance"],
      },
    ]);
  }

  if (location.maxDriveDistance < travelTime.distance.value) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "MAX_DRIVE_DISTANCE_EXCEEDED",
        path: ["maxDriveDistance"],
      },
    ]);
  }

  const cost = ShippingServiceCalculateCost({
    ...travelTime,
    origin: location,
  });

  return {
    ...travelTime,
    cost: {
      value: cost,
      currency: "DKK",
    },
  };
};
