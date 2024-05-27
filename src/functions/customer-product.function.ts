import { app } from "@azure/functions";
import * as df from "durable-functions";
import "module-alias/register";
import { CustomerProductOptionsControllerAdd } from "./customer/controllers/product-options/add";
import { CustomerProductOptionsControllerDestroy } from "./customer/controllers/product-options/destroy";
import { CustomerProductOptionsControllerList } from "./customer/controllers/product-options/list";
import { CustomerProductOptionsControllerUpdate } from "./customer/controllers/product-options/update";
import { CustomerProductControllerAdd } from "./customer/controllers/product/add";
import { CustomerProductControllerDestroy } from "./customer/controllers/product/destroy";
import { CustomerProductControllerGet } from "./customer/controllers/product/get";
import { CustomerProductControllerUpdate } from "./customer/controllers/product/update";
import { CustomerProductsControllerListIds } from "./customer/controllers/products";
import { CustomerProductsControllerList } from "./customer/controllers/products/list";

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

app.http("customerProductUpdate", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "customer/{customerId?}/product/{productId?}",
  handler: CustomerProductControllerUpdate,
  extraInputs: [df.input.durableClient()],
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
  extraInputs: [df.input.durableClient()],
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
