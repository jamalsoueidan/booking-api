import { UserServiceLocationsAdd } from "~/functions/user";
import { LocationModel } from "../location.model";
import { Location } from "../location.types";
import { LocationServiceValidateAddress } from "./validate-address";

export type LocationServiceCreateProps = Location;

export const LocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  let result = await LocationServiceValidateAddress(body.fullAddress);
  const location = new LocationModel(body);
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [result.longitude, result.latitude];
  location.fullAddress = result.fullAddress;
  location.handle = createSlug(body.name);
  const newLocationDoc = await location.save();
  await UserServiceLocationsAdd({
    _id: newLocationDoc._id.toString(),
    customerId: newLocationDoc.customerId,
  });
  return newLocationDoc;
};

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}
