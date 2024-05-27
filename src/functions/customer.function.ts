import { app } from "@azure/functions";
import * as df from "durable-functions";
import "module-alias/register";

import {
  CustomerControllerCreate,
  CustomerControllerGet,
  CustomerControllerIsBusiness,
  CustomerControllerStatus,
  CustomerControllerUpdate,
} from "./customer/controllers/customer";

app.http("customerUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}",
  handler: CustomerControllerUpdate,
});

app.http("customerCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer",
  extraInputs: [df.input.durableClient()],
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
