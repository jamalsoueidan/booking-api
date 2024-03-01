import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerOrderControllerGet } from "./customer/controllers/order/get";

app.http("customerOrderGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders/{orderId?}",
  handler: CustomerOrderControllerGet,
});
