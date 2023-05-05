import "module-alias/register";

import { app } from "@azure/functions";
import {
  CustomerControllerCreateOrUpdate,
  CustomerProductAvailabilityControllerGet,
  CustomerProductsControllerGet,
} from "./customer";

app.http("customerCreateOrUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}",
  handler: CustomerControllerCreateOrUpdate,
});

app.http("customerProductsGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/products",
  handler: CustomerProductsControllerGet,
});

app.http("customerProductAvailabilityGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}/availability",
  handler: CustomerProductAvailabilityControllerGet,
});
