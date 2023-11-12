import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
  app,
  output,
} from "@azure/functions";
import "module-alias/register";

export async function storageQueueTrigger1(
  queueItem: unknown,
  context: InvocationContext
): Promise<void> {
  context.log("Storage queue function processed work item:", queueItem);
}

app.storageQueue("storageQueueTrigger1", {
  queueName: "outqueue",
  connection: "QueueStorage",
  handler: storageQueueTrigger1,
});

const queueOutput = output.storageQueue({
  queueName: "outqueue",
  connection: "QueueStorage",
});

export async function httpTrigger1(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = await request.json();
  context.extraOutputs.set(queueOutput, body);
  return { body: "Created queue item." };
}

app.http("httpTrigger1", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "testerne",
  extraOutputs: [queueOutput],
  handler: httpTrigger1,
});
