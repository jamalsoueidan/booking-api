import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerOrderControllerGet } from "./customer/controllers/order/get";
import { CustomerOrderControllerRange } from "./customer/controllers/order/range";

app.http("customerOrderGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders/{orderId?}/groupId/{groupId?}",
  handler: CustomerOrderControllerGet,
});

app.http("customerOrderRange", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders-range",
  handler: CustomerOrderControllerRange,
});
