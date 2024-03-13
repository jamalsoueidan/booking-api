import "@shopify/shopify-api/adapters/node";
import "module-alias/register";

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  output,
} from "@azure/functions";
import { webhookProductProcess } from "./webhook/product/product";
import { productUpdateSchema } from "./webhook/product/types";

export const productQueueName = "webhook-product";
export const productQueueOutput = output.storageQueue({
  queueName: productQueueName,
  connection: "QueueStorage",
});

app.storageQueue("webhookProductUpdateProcess", {
  queueName: productQueueName,
  connection: "QueueStorage",
  handler: webhookProductProcess,
});

export async function webhookProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = await request.json();
  const parser = productUpdateSchema.safeParse(body);
  if (parser.success) {
    context.extraOutputs.set(productQueueOutput, parser.data);
    context.log(`Started storageQueue with ID = '${productQueueName}'.`);
  }
  return { body: "Created queue item." };
}

app.http("webhookProductUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/product",
  extraOutputs: [productQueueOutput],
  handler: webhookProduct,
});
