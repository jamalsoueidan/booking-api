import { Location, LocationModel } from "~/functions/location";
import { LocationServiceGetCoordinates } from "~/functions/location/services/get-coordinates";

export type LocationServiceCreateProps = Location;

export const CustomerLocationServiceCreate = async (
  body: LocationServiceCreateProps
) => {
  const result = await LocationServiceGetCoordinates(body);
  const location = new LocationModel(body);
  location.geoLocation.type = "Point";
  location.geoLocation.coordinates = [result.longitude, result.latitude];
  location.fullAddress = result.fullAddress;
  location.handle = createSlug(body.name);
  return location.save();
};

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}
