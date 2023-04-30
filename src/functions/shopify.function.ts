import { app } from "@azure/functions";
import * as df from "durable-functions";
import { ShopifyControllerSearchCustomers } from "./shopify";
import { ShopifyControllerLoadData } from "./shopify/shopify-controller/load-data";
import { ShopifyDurableLoadData } from "./shopify/shopify-durable";

app.http("shopifyLoadData", {
  route: "shopify/load-data",
  extraInputs: [df.input.durableClient()],
  handler: ShopifyDurableLoadData,
});

app.http("shopifyLoad", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "shopify/load",
  handler: ShopifyControllerLoadData,
});

app.http("shopifySearchCustomers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "shopify/search-customers",
  handler: ShopifyControllerSearchCustomers,
});
