import { app } from "@azure/functions";
import "module-alias/register";
import {
  LocationControllerGetCoordinates,
  LocationControllerGetTravelTime,
  LocationControllerValidateAddress,
} from "./location/controllers";

app.http("locationGetCoordinates", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "location/get-coordinates",
  handler: LocationControllerGetCoordinates,
});

app.http("locationValidateAddress", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "location/validate-address",
  handler: LocationControllerValidateAddress,
});

app.http("locationGetTravelTime", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "location/get-travel-time",
  handler: LocationControllerGetTravelTime,
});
