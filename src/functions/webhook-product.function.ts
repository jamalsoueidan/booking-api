import "module-alias/register";

import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import * as df from "durable-functions";
import { deleteVariantsHandler } from "./webhook/product/product";
import {
  ProductUpdateSchema,
  productUpdateSchema,
} from "./webhook/product/types";

df.app.activity("updateVariants", {
  handler: deleteVariantsHandler,
});

df.app.orchestration(
  "processProductVariant",
  function* (context: df.OrchestrationContext) {
    const input = context.df.getInput();
    // Wait for 2 minutes
    // We delay the call so that our webhook doesn't delete the variant the customer just created.
    const dueTime = new Date(new Date().getTime() + 2 * 60000);
    yield context.df.createTimer(dueTime);

    const data: Awaited<ReturnType<typeof deleteVariantsHandler>> =
      yield context.df.callActivity("updateVariants", input);

    if (!data?.productVariantsBulkDelete?.product) {
      context.error(
        "orchestration process product error",
        data?.productVariantsBulkDelete?.userErrors
      );
    }
  }
);

export async function webhookProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const body = (await request.json()) as ProductUpdateSchema;
  const parser = productUpdateSchema.safeParse(body);
  if (parser.success) {
    const instanceId = `processProductVariantID-${body.handle}`;
    const client = df.getClient(context);
    let status;

    try {
      status = await client.getStatus(instanceId);
    } catch (error) {
      context.log(`Error checking status for ${instanceId}: ${error}`);
    }

    if (
      status &&
      (status.runtimeStatus === "Running" || status.runtimeStatus === "Pending")
    ) {
      // Instance is already running, attempt to terminate it
      await client.terminate(
        instanceId,
        "Starting a new instance due to update."
      );
      context.log(`Terminated existing instance ${instanceId}.`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

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
