import { app } from "@azure/functions";
import "module-alias/register";
import {
  BookingControllerCreate,
  BookingControllerGetAll,
  BookingControllerGetById,
  BookingControllerUpdate,
} from "./booking";

app.http("bookingGetById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "booking/{_id?}",
  handler: BookingControllerGetById,
});

app.http("bookingGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "bookings",
  handler: BookingControllerGetAll,
});

app.http("bookingUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "booking/{_id?}",
  handler: BookingControllerUpdate,
});

app.http("bookingCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "booking",
  handler: BookingControllerCreate,
});
