import "module-alias/register";
import { CustomerProductsControllerList } from "./customer/controllers/products/list";

import { app } from "@azure/functions";

import {
  CustomerProductControllerDestroy,
  CustomerProductControllerGet,
  CustomerProductControllerUpsert,
} from "./customer/controllers/product";
import { CustomerProductsControllerListIds } from "./customer/controllers/products";

app.http("customerProductsListIds", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/products/ids",
  handler: CustomerProductsControllerListIds,
});

app.http("customerProductsList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/products",
  handler: CustomerProductsControllerList,
});

app.http("customerProductUpsert", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerUpsert,
});

app.http("customerProductGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerGet,
});

app.http("customerProductDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerDestroy,
});
