import "module-alias/register";
import { CustomerProductOptionsControllerList } from "./customer/controllers/product-options/list";
import { CustomerProductsControllerList } from "./customer/controllers/products/list";

import { app } from "@azure/functions";

import { CustomerProductOptionsControllerAdd } from "./customer/controllers/product-options/add";
import { CustomerProductOptionsControllerDestroy } from "./customer/controllers/product-options/destroy";
import { CustomerProductOptionsControllerUpdate } from "./customer/controllers/product-options/update";
import { CustomerProductControllerAdd } from "./customer/controllers/product/add";
import { CustomerProductControllerCreateVariant } from "./customer/controllers/product/create-variant";
import { CustomerProductControllerDestroy } from "./customer/controllers/product/destroy";
import { CustomerProductControllerGet } from "./customer/controllers/product/get";
import { CustomerProductControllerUpdate } from "./customer/controllers/product/update";
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

app.http("customerProductUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerUpdate,
});

app.http("customerProductOptionsAdd", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}/options",
  handler: CustomerProductOptionsControllerAdd,
});

app.http("customerProductOptionsList", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}/options",
  handler: CustomerProductOptionsControllerList,
});

app.http("customerProductOptionsDestroy", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route:
    "customer/{customerId?}/product/{productId?}/options/{optionProductId?}",
  handler: CustomerProductOptionsControllerDestroy,
});

app.http("customerProductOptionsUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route:
    "customer/{customerId?}/product/{productId?}/options/{optionProductId?}",
  handler: CustomerProductOptionsControllerUpdate,
});

app.http("customerProductAdd", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product",
  handler: CustomerProductControllerAdd,
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
