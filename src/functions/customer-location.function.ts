import "module-alias/register";

import { app } from "@azure/functions";
import * as df from "durable-functions";
import {
  CustomerLocationControllerCreate,
  CustomerLocationControllerGetAll,
  CustomerLocationControllerGetOne,
  CustomerLocationControllerRemove,
  CustomerLocationControllerSetDefault,
  CustomerLocationControllerUpdate,
} from "./customer/controllers/location";
import { CustomerLocationControllerGetProducts } from "./customer/controllers/location/get-products";

app.http("customerLocationList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId}/locations",
  handler: CustomerLocationControllerGetAll,
});

app.http("customerLocationGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}",
  handler: CustomerLocationControllerGetOne,
});

app.http("customerLocationGetProducts", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}/products",
  handler: CustomerLocationControllerGetProducts,
});

app.http("customerLocationUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId?}",
  handler: CustomerLocationControllerUpdate,
  extraInputs: [df.input.durableClient()],
});

app.http("customerLocationCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId}/locations",
  handler: CustomerLocationControllerCreate,
  extraInputs: [df.input.durableClient()],
});

app.http("customerLocationRemove", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}",
  handler: CustomerLocationControllerRemove,
});

app.http("customerLocationSetDefault", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}/setDefault",
  handler: CustomerLocationControllerSetDefault,
});
