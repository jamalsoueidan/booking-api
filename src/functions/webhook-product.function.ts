import "module-alias/register";

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import * as df from "durable-functions";
import { updateVariantsHandler } from "./webhook/product/product";
import { productUpdateSchema } from "./webhook/product/types";

df.app.activity("updateVariants", {
  handler: updateVariantsHandler,
});

df.app.orchestration(
  "processProductVariant",
  function* (context: df.OrchestrationContext) {
    const input = context.df.getInput();
    // Wait for 2 minutes
    // We delay the call so that our webhook doesn't delete the variant the customer just created.
    const dueTime = new Date(new Date().getTime() + 2 * 60000);
    yield context.df.createTimer(dueTime);

    const data: Awaited<ReturnType<typeof updateVariantsHandler>> =
      yield context.df.callActivity("updateVariants", input);

    if (!data?.productVariantsBulkDelete?.product) {
      context.error(
        "orchestration process product error",
        data?.productVariantsBulkDelete?.userErrors
      );
    }
  }
);

const instanceId = "processProductVariantID";

export async function webhookProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const client = df.getClient(context);
  let status;
  try {
    status = await client.getStatus(instanceId);
  } catch (error) {
    console.log(`Error checking status for ${instanceId}: ${error}`);
  }

  if (
    status &&
    (status.runtimeStatus === "Running" || status.runtimeStatus === "Pending")
  ) {
    // An instance is already running, no action needed
    context.log(`Instance ${instanceId} is already running.`);
    return { body: "An instance is already running." };
  }
  const body = await request.json();
  const parser = productUpdateSchema.safeParse(body);
  if (parser.success) {
    await client.startNew("processProductVariant", {
      instanceId,
      input: body,
    });
    context.log(`Started orchestration with ID = '${instanceId}'.`);
    return client.createCheckStatusResponse(request, instanceId);
  }

  return { body: "starts" };
}

app.http("webhookProductUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/product",
  extraInputs: [df.input.durableClient()],
  handler: webhookProduct,
});
