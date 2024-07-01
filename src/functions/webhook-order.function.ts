import "module-alias/register";

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  output,
} from "@azure/functions";
import { webhookOrderProcess } from "./webhook/order/order";

export const orderQueueName = "webhook-order";
export const orderQueueOutput = output.storageQueue({
  queueName: orderQueueName,
  connection: "QueueStorage",
});

app.storageQueue("webhookOrderUpdateProcess", {
  queueName: orderQueueName,
  connection: "QueueStorage",
  handler: webhookOrderProcess,
});

export async function webhookOrder(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = await request.json();
  context.extraOutputs.set(orderQueueOutput, body);
  return { body: "Created queue item." };
}

app.http("webhookOrder", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/order",
  extraOutputs: [orderQueueOutput],
  handler: webhookOrder,
});
