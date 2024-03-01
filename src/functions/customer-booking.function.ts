import { app } from "@azure/functions";
import "module-alias/register";
import { CustomerBookingControllerGetByGroup } from "./customer/controllers/booking/get-by-group";
import { CustomerBookingControllerRange } from "./customer/controllers/booking/range";

app.http("customerOrderGetByGroupId", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/bookings/{orderId?}/group/{groupId?}",
  handler: CustomerBookingControllerGetByGroup,
});

app.http("customerOrderRange", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/bookings/range",
  handler: CustomerBookingControllerRange,
});
