import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerOrderControllerGet } from "./customer/controllers/order/get";
import { CustomerOrderControllerGetLineItem } from "./customer/controllers/order/get-lineitem";
import { CustomerOrderControllerGetShipping } from "./customer/controllers/order/get-shipping";
import { CustomerOrderControllerList } from "./customer/controllers/order/list";
import { CustomerOrderControllerShipping } from "./customer/controllers/order/shipping";

app.http("customerOrderGetLineItem", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/lineItem/{lineItemId?}",
  handler: CustomerOrderControllerGetLineItem,
});

app.http("customerOrderGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders/{orderId?}",
  handler: CustomerOrderControllerGet,
});

app.http("customerOrderList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/orders-range",
  handler: CustomerOrderControllerList,
});

app.http("customerOrderShipping", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/shipping-range",
  handler: CustomerOrderControllerShipping,
});

app.http("customerOrderGetShipping", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/get-shipping/{id?}",
  handler: CustomerOrderControllerGetShipping,
});
