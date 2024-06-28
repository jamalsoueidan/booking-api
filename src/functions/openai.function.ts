import { app } from "@azure/functions";
import "module-alias/register";
import {
  LocationControllerGetCoordinates,
  LocationControllerGetTravelTime,
} from "./location/controllers";

app.http("tes", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "asd/get-coordinates",
  handler: LocationControllerGetCoordinates,
});

app.http("asd", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "asd/get-travel-time",
  handler: LocationControllerGetTravelTime,
});
