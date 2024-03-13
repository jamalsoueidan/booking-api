import {
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
  app,
} from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { type FileGetQuery } from "~/types/admin.generated";
import { fileCreateHandler } from "./customer/controllers/upload/file-create";
import { fileGetHandler } from "./customer/controllers/upload/file-get";
import {
  FileInputProps,
  fileInputSchema,
} from "./customer/controllers/upload/types";
import { updateCustomerHandler } from "./customer/controllers/upload/update-customer";

df.app.activity("fileCreate", {
  handler: fileCreateHandler,
});

df.app.activity("fileGet", {
  handler: fileGetHandler,
});

df.app.activity("updateCustomerHandler", {
  handler: updateCustomerHandler,
});

df.app.orchestration("upload", function* (context: OrchestrationContext) {
  const body = context.df.getInput() as FileInputProps;

  const zodParse = fileInputSchema.safeParse(body);
  if (!zodParse.success) {
    context.error("Error parsing request body:", zodParse.error);
    return { sucess: false, error: zodParse.error };
  }

  yield context.df.callActivity("fileCreate", body);

  const maxRetries = 5;
  let attemptCount = 0;
  let fileUploaded: FileGetQuery["files"]["nodes"][number] | undefined;

  while (!fileUploaded && attemptCount < maxRetries) {
    // Wait for 5 seconds before each new attempt
    const nextCheckTime = new Date(
      context.df.currentUtcDateTime.getTime() + 3 * 1000 // try every 3 seconds
    );
    yield context.df.createTimer(nextCheckTime);

    // Check if data is available from Shopify
    const response: Awaited<ReturnType<typeof fileGetHandler>> =
      yield context.df.callActivity("fileGet", body);
    if (response && response.files.nodes.length > 0) {
      fileUploaded = response.files.nodes[0];
    }

    attemptCount++;
  }

  if (fileUploaded) {
    return yield context.df.callActivity("updateCustomer", {
      customerId: body.customerId,
      image: fileUploaded.preview?.image,
    });
  }

  context.error(`Data for ${body.customerId} not available after retries.`);

  return {
    failed: true,
  };
});

const uploadOrchestrator: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const body: unknown = await request.json();

  const instanceId: string = await client.startNew(
    request.params.orchestratorName,
    { input: body }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);
  return client.createCheckStatusResponse(request, instanceId);
};

app.http("orchestratorsHttpStart", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "orchestrators/upload",
  extraInputs: [df.input.durableClient()],
  handler: uploadOrchestrator,
});
