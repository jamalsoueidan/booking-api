import "module-alias/register";

import { app } from "@azure/functions";

import {
  CustomerLocationControllerAdd,
  CustomerLocationControllerCreate,
  CustomerLocationControllerGetAll,
  CustomerLocationControllerGetAllOrigins,
  CustomerLocationControllerGetOne,
  CustomerLocationControllerRemove,
  CustomerLocationControllerSetDefault,
  CustomerLocationControllerUpdate,
} from "./customer/controllers/location";

app.http("customerLocationGetAllOrigins", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId}/locations/get-all-origins",
  handler: CustomerLocationControllerGetAllOrigins,
});

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

app.http("customerLocationUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId?}",
  handler: CustomerLocationControllerUpdate,
});

app.http("customerLocationCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId}/locations",
  handler: CustomerLocationControllerCreate,
});

app.http("customerLocationAdd", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId}/location/{locationId}",
  handler: CustomerLocationControllerAdd,
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
