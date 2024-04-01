import "module-alias/register";

import { app } from "@azure/functions";

import { CustomerPayoutLogControllerPaginate } from "./customer/controllers/payout-log/paginate";

app.http("customerPayoutLogPaginate", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/payout-logs/{payoutId}/paginate",
  handler: CustomerPayoutLogControllerPaginate,
});
