import { app } from "@azure/functions";
import { BookingControllerUpsert } from "./booking/controllers/upsert";

app.http("bookingUpsert", {
  methods: ["POST", "PUT"],
  authLevel: "anonymous",
  route: "booking/{orderId?}",
  handler: BookingControllerUpsert,
});
