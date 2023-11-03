import { app } from "@azure/functions";
import "module-alias/register";
import {
  ShippingControllerCalculate,
  ShippingControllerCreate,
  ShippingControllerRates,
} from "./shipping/controllers";

app.http("shippingRates", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/rates",
  handler: ShippingControllerRates,
});

app.http("shippingCalculate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/calculate",
  handler: ShippingControllerCalculate,
});

app.http("shippingCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/create",
  handler: ShippingControllerCreate,
});
