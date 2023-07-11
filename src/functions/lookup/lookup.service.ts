import { LocationServiceLookup } from "~/functions/location/services";
import { StringOrObjectId } from "~/library/zod";
import { LookupModel } from "./lookup.model";
import { Lookup } from "./lookup.type";

export type LookupServiceCreateProps = {
  customerId: number;
  locationId: StringOrObjectId;
  destination?: Lookup["destination"];
};

export const LookupServiceCreate = async (props: LookupServiceCreateProps) => {
  const lookup = await LocationServiceLookup(props);
  const durationValue =
    Math.ceil((lookup?.travelTime.duration.value || 0) / (60 * 5)) * 5;

  if (lookup) {
    const Lookup = new LookupModel({
      origin: {
        location: props.locationId,
        ...lookup.location,
      },
      destination: props.destination,
      ...lookup.travelTime,
      duration: {
        text: lookup.travelTime.duration.text,
        value: durationValue, // we round this value
      },
    });

    return Lookup.save();
  }
};
