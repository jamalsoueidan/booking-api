import "module-alias/register";

import { app } from "@azure/functions";

import {
  CustomerControllerGet,
  CustomerControllerIsBusiness,
  CustomerControllerStatus,
  CustomerControllerUpdate,
  CustomerControllerUpsert,
} from "./customer/controllers/customer";

/* Customer */

app.http("customerUpsert", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}",
  handler: CustomerControllerUpsert,
});

app.http("customerUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/update",
  handler: CustomerControllerUpdate,
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
