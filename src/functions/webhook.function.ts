import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  app,
  output,
} from "@azure/functions";
import "@shopify/shopify-api/adapters/node";
import "module-alias/register";

const queueName = "webhook-ordre-update";
const queueOutput = output.storageQueue({
  queueName,
  connection: "QueueStorage",
});

export async function ordreUpdateProcess(
  queueItem: unknown,
  context: InvocationContext
): Promise<void> {
  context.log("Webhook input:", queueItem);
}

app.storageQueue("webhookOrdreUpdateProcess", {
  queueName,
  connection: "QueueStorage",
  handler: ordreUpdateProcess,
});

export async function ordreUpdate(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = await request.json();
  context.extraOutputs.set(queueOutput, body);
  context.trace("Webhook body:", body);
  return { body: "Created queue item." };
}

app.http("webhookOrdreUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/ordre/update",
  extraOutputs: [queueOutput],
  handler: ordreUpdate,
});
