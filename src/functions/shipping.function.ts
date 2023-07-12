import { app } from "@azure/functions";
import {
  ShippingControllerCalculate,
  ShippingControllerGet,
} from "./shipping/controllers";

app.http("shippingRates", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/rates",
  handler: ShippingControllerGet,
});

app.http("shippingCalculator", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/calculate",
  handler: ShippingControllerCalculate,
});
