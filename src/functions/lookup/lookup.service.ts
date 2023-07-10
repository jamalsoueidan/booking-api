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

  if (lookup) {
    const Lookup = new LookupModel({
      origin: {
        location: props.locationId,
        ...lookup.location,
      },
      destination: props.destination,
      ...lookup.travelTime,
    });

    return Lookup.save();
  }
};
