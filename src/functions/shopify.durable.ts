import { app } from "@azure/functions";
import * as df from "durable-functions";
import { ShopifyDurableloadData } from "./shopify";

app.http("shopify", {
  route: "orchestrators/{orchestratorName}",
  extraInputs: [df.input.durableClient()],
  handler: ShopifyDurableloadData,
});
