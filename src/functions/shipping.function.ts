import { app } from "@azure/functions";
import { ShippingControllerGet } from "./shipping/shipping.controller";

app.http("shippingRates", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/rates",
  handler: ShippingControllerGet,
});
