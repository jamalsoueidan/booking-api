import { app } from "@azure/functions";
import * as df from "durable-functions";
import { ShopifyDurableLoadData } from "./shopify";

app.http("shopify", {
  route: "orchestrators/{orchestratorName}",
  extraInputs: [df.input.durableClient()],
  handler: ShopifyDurableLoadData,
});
