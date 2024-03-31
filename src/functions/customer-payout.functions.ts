import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerPayoutControllerBalance } from "./customer/controllers/payout/balance";
import { CustomerPayoutControllerGet } from "./customer/controllers/payout/get";
import { CustomerPayoutControllerPaginate } from "./customer/controllers/payout/paginate";

app.http("customerPayoutGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/payout/{payoutId?}",
  handler: CustomerPayoutControllerGet,
});

app.http("customerPayoutBalance", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/payout/balance",
  handler: CustomerPayoutControllerBalance,
});

app.http("customerPayoutPaginate", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/payout",
  handler: CustomerPayoutControllerPaginate,
});
