import { app } from "@azure/functions";
import "@shopify/shopify-api/adapters/node";
import "module-alias/register";
import { orderQueueOutput, webhookOrder } from "./webhook/order";

app.http("webhookOrder", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/order",
  extraOutputs: [orderQueueOutput],
  handler: webhookOrder,
});
