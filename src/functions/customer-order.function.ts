import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerOrderControllerGet } from "./customer/controllers/order/get";
import { CustomerOrderControllerList } from "./customer/controllers/order/list";

app.http("customerOrderGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/lineItemId/{lineItemId?}",
  handler: CustomerOrderControllerGet,
});

app.http("customerOrderList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders",
  handler: CustomerOrderControllerList,
});
