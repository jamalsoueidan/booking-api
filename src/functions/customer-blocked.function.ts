import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerBlockedControllerCreate } from "./customer/controllers/blocked/create";
import { CustomerBlockedControlleDestroy } from "./customer/controllers/blocked/destroy";
import { CustomerBlockedControllerList } from "./customer/controllers/blocked/list";
import { CustomerBlockedControllerRange } from "./customer/controllers/blocked/range";

app.http("customerBlockedDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/blocked/{blockedId?}",
  handler: CustomerBlockedControlleDestroy,
});

app.http("customerBlockedCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/blocked",
  handler: CustomerBlockedControllerCreate,
});

app.http("customerBlockedList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/blocked/list",
  handler: CustomerBlockedControllerList,
});

app.http("customerBlockedRange", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/blocked/range",
  handler: CustomerBlockedControllerRange,
});
