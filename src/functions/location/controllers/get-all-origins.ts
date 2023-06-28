import { _ } from "~/library/handler";
import { LocationServiceGetAllOrigins } from "../services/location.service";

export type LocationControllerGetAllOriginsRequest = {};

export type LocationControllerGetAllOriginsResponse = Awaited<
  ReturnType<typeof LocationServiceGetAllOrigins>
>;

export const LocationControllerGetAllOrigins = _(() => {
  return LocationServiceGetAllOrigins();
});
