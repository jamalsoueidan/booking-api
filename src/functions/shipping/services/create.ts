import { LocationServiceGet } from "~/functions/location/services/get";
import { LocationServiceGetTravelTime } from "~/functions/location/services/get-travel-time";
import { StringOrObjectIdType } from "~/library/zod";
import { ShippingModel } from "../shipping.model";
import { Shipping } from "../shipping.types";
import { ShippingServiceCalculateCost } from "./calculate-cost";

export type ShippingServiceCreateProps = {
  customerId: number;
  locationId: StringOrObjectIdType;
  destination: Shipping["destination"];
};

export const ShippingServiceCreate = async (
  props: ShippingServiceCreateProps
) => {
  const location = await LocationServiceGet(props);

  const travelTime = await LocationServiceGetTravelTime({
    origin: location.fullAddress,
    destination: props.destination.fullAddress,
  });

  const cost = await ShippingServiceCalculateCost({
    ...travelTime,
    origin: location,
  });

  const shipping = new ShippingModel({
    location: props.locationId,
    origin: {
      ...location,
      customerId: props.customerId,
    },
    destination: props.destination,
    ...travelTime,
    cost: {
      value: cost,
      currency: "DKK",
    },
  });

  return shipping.save();
};
