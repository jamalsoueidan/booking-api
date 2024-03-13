import "module-alias/register";
import { CustomerProductsControllerList } from "./customer/controllers/products/list";

import { app } from "@azure/functions";

import { CustomerProductControllerCreateVariant } from "./customer/controllers/product/create-variant";
import { CustomerProductControllerDestroy } from "./customer/controllers/product/destroy";
import { CustomerProductControllerGet } from "./customer/controllers/product/get";
import { CustomerProductControllerUpsert } from "./customer/controllers/product/upsert";
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

app.http("customerProductCreateVariant", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}/create-variant",
  handler: CustomerProductControllerCreateVariant,
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
