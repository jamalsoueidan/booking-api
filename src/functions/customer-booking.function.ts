import "module-alias/register";

import { app } from "@azure/functions";

import {
  CustomerBookingControllerGet,
  CustomerBookingControllerList,
} from "./customer/controllers/booking";

app.http("customerBookingGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/booking/{orderId?}",
  handler: CustomerBookingControllerGet,
});

app.http("customerBookingList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/bookings",
  handler: CustomerBookingControllerList,
});
