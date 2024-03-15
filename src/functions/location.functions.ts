import { app } from "@azure/functions";
import "module-alias/register";
import {
  LocationControllerGetCoordinates,
  LocationControllerGetTravelTime,
} from "./location/controllers";

app.http("locationGetCoordinates", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "location/get-coordinates",
  handler: LocationControllerGetCoordinates,
});

app.http("locationGetTravelTime", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "location/get-travel-time",
  handler: LocationControllerGetTravelTime,
});
