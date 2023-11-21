import "module-alias/register";
import { UserAvailabilityControllerGet } from "./user/controllers/availability/get";

import { app } from "@azure/functions";

import { UserAvailabilityControllerGenerate } from "./user/controllers/availability";

app.http("userAvailabilityGenerate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{username?}/availability/{locationId?}/generate",
  handler: UserAvailabilityControllerGenerate,
});

app.http("userAvailabilityGet", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{username?}/availability/{locationId?}/get",
  handler: UserAvailabilityControllerGet,
});
