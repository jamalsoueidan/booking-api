import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerAvailabilityControllerGet } from "./customer/controllers/availability";

app.http("customerAvailabilityGet", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/availability/{locationId?}/get",
  handler: CustomerAvailabilityControllerGet,
});
