import "module-alias/register";

import { app } from "@azure/functions";
import {
  AvailabilityControllerGetAvailability,
  AvailabilityControllerGetSettings,
  AvailabilityControllerGetUsers,
} from "./availability";

app.http("availabilityGetUsers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "availability/{productId?}/get-users",
  handler: AvailabilityControllerGetUsers,
});

app.http("availabilityGetAvailability", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "availability/{productId?}/get-availability",
  handler: AvailabilityControllerGetAvailability,
});

app.http("availabilityGetSettings", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "availability/{productId?}/get-settings",
  handler: AvailabilityControllerGetSettings,
});
