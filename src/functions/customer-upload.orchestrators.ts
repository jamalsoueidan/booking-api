import {
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
  app,
} from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { activityType } from "~/library/orchestration";
import { fileCreateHandler } from "./customer/controllers/upload/file-create";
import { fileGetHandler } from "./customer/controllers/upload/file-get";
import {
  FileInputProps,
  fileInputSchema,
} from "./customer/controllers/upload/types";
import { updateCustomerHandler } from "./customer/controllers/upload/update-customer";
import {
  updateArticle,
  updateArticleName,
} from "./customer/orchestrations/customer/update/update-article";

df.app.activity("fileCreate", {
  handler: fileCreateHandler,
});

df.app.activity("fileGet", {
  handler: fileGetHandler,
});

df.app.activity("updateCustomer", {
  handler: updateCustomerHandler,
});

df.app.orchestration("upload", function* (context: OrchestrationContext) {
  const body = context.df.getInput() as FileInputProps;

  const zodParse = fileInputSchema.safeParse(body);
  if (!zodParse.success) {
    context.error("Error parsing request body:", zodParse.error);
    return { sucess: false, error: zodParse.error };
  }

  const response: Awaited<ReturnType<typeof fileCreateHandler>> =
    yield context.df.callActivity("fileCreate", zodParse.data);

  const maxRetries = 5;
  let attemptCount = 0;
  let fileUploaded: boolean = false;

  while (!fileUploaded && attemptCount < maxRetries) {
    // Wait for 5 seconds before each new attempt
    const nextCheckTime = new Date(
      context.df.currentUtcDateTime.getTime() + 3 * 1000 // try every 3 seconds
    );
    yield context.df.createTimer(nextCheckTime);

    // Check if data is available from Shopify
    const profile: Awaited<ReturnType<typeof fileGetHandler>> =
      yield context.df.callActivity("fileGet", response.id);
    if (profile) {
      fileUploaded = true;
      context.info(`Data for ${body.customerId} not available after retries.`);
      const user: Awaited<ReturnType<typeof updateCustomerHandler>> =
        yield context.df.callActivity("updateCustomer", {
          customerId: zodParse.data.customerId,
          profile,
          metaobjectId: response.id,
        });

      return yield context.df.callActivity(
        updateArticleName,
        activityType<typeof updateArticle>({
          user,
        })
      );
    }

    attemptCount++;
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
  const instanceId: string = await client.startNew("upload", { input: body });

  context.log(`Started orchestration with ID = '${instanceId}'.`);
  return client.createCheckStatusResponse(request, instanceId);
};

app.http("orchestratorUpload", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "orchestrators/upload",
  extraInputs: [df.input.durableClient()],
  handler: uploadOrchestrator,
});
