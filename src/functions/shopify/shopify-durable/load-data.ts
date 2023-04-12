import {
  HttpHandler,
  HttpRequest,
  HttpResponse,
  InvocationContext,
} from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext, OrchestrationHandler } from "durable-functions";
import { ShopifyServiceLoadCollections } from "../shopify-service/load-collections";

const runTask: OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const outputs = [];
  outputs.push(yield context.df.callActivity("load-collections"));
  return outputs;
};

df.app.orchestration("shopify-load-data", runTask);
df.app.activity("load-collections", { handler: ShopifyServiceLoadCollections });

export const ShopifyDurableLoadData: HttpHandler = async (
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponse> => {
  const client = df.getClient(context);
  const body: unknown = await request.text();
  console.log(request.params.orchestratorName);
  const instanceId: string = await client.startNew(
    request.params.orchestratorName,
    { input: body }
  );

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return client.createCheckStatusResponse(request, instanceId);
};
