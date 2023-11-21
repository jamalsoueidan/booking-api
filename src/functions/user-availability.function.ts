import "module-alias/register";

import { app } from "@azure/functions";

import { UserAvailabilityControllerGenerate } from "./user/controllers/availability";

app.http("userAvailabilityGenerate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/{username?}/availability/{locationId?}/generate",
  handler: UserAvailabilityControllerGenerate,
});
