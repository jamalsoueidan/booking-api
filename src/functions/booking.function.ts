import { app } from "@azure/functions";
import { BookingControllerCreate } from "./booking/controllers/create";
import { BookingControllerUpdate } from "./booking/controllers/update";

app.http("bookingNewPost", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "booking/{orderId?}",
  handler: BookingControllerCreate,
});

app.http("bookingUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "booking/{orderId?}",
  handler: BookingControllerUpdate,
});
