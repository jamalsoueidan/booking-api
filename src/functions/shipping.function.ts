import { app } from "@azure/functions";
import "module-alias/register";

import { ShippingControllerCalculate } from "./shipping/controllers/calculate";
import { ShippingControllerCreate } from "./shipping/controllers/create";
import { ShippingControllerGet } from "./shipping/controllers/get";
import { ShippingControllerRates } from "./shipping/controllers/rates";

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

app.http("shippingGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "shipping/{shippingId}",
  handler: ShippingControllerGet,
});

app.http("shippingCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "shipping/create",
  handler: ShippingControllerCreate,
});
