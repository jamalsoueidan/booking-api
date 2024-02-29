import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerOrderControllerGet } from "./customer/controllers/order/get";
import { CustomerOrderControllerGetByGroup } from "./customer/controllers/order/get-by-group";
import { CustomerOrderControllerRange } from "./customer/controllers/order/range";

app.http("customerOrderGetByGroupId", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders/{orderId?}/group/{groupId?}",
  handler: CustomerOrderControllerGetByGroup,
});

app.http("customerOrderGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders/{orderId?}",
  handler: CustomerOrderControllerGet,
});

app.http("customerOrderRange", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders-range",
  handler: CustomerOrderControllerRange,
});
