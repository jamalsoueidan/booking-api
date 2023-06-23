import { app } from "@azure/functions";
import {
  LocationControllerCreate,
  LocationControllerGetCoordinates,
  LocationControllerGetTravelTime,
  LocationControllerUpdate,
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

app.http("locationEdit", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "location/{locationId?}",
  handler: LocationControllerUpdate,
});

app.http("locationCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "locations",
  handler: LocationControllerCreate,
});
