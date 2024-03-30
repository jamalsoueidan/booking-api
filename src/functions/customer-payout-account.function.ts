import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerPayoutAccountControllerCreate } from "./customer/controllers/payout-account/create";
import { CustomerPayoutAccountControlleDestroy } from "./customer/controllers/payout-account/destroy";
import { CustomerPayoutAccountControllerGet } from "./customer/controllers/payout-account/get";

app.http("customerPayoutAccountDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/payout-account/{payoutAccountId?}",
  handler: CustomerPayoutAccountControlleDestroy,
});

app.http("customerPayoutAccountCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/payout-account",
  handler: CustomerPayoutAccountControllerCreate,
});

app.http("customerPayoutAccountGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/payout-account",
  handler: CustomerPayoutAccountControllerGet,
});
