import "module-alias/register";

import { app } from "@azure/functions";

import {
  CustomerControllerCreate,
  CustomerControllerGet,
  CustomerControllerIsBusiness,
  CustomerControllerStatus,
  CustomerControllerUpdate,
} from "./customer/controllers/customer";

app.http("customerUpsert", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}",
  handler: CustomerControllerUpdate,
});

app.http("customerCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer",
  handler: CustomerControllerCreate,
});

app.http("customerIsBusiness", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/isBusiness",
  handler: CustomerControllerIsBusiness,
});

app.http("customerGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}",
  handler: CustomerControllerGet,
});

app.http("customerStatus", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/status",
  handler: CustomerControllerStatus,
});
